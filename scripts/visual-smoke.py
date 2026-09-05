from playwright.sync_api import sync_playwright
from pathlib import Path
import json, struct, os
root=Path(__file__).resolve().parents[1]
out=root/'.scratch/bilibili-share-poster/visual-polish/acceptance/artifacts'
out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path=os.environ.get("BSP_CHROMIUM_EXECUTABLE"))
    page=browser.new_page(viewport={'width':1280,'height':900}, device_scale_factor=1)
    errors=[]
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.route('https://www.bilibili.com/**',lambda r:r.fulfill(content_type='text/html',body='''<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;background:#eff1f3;font-family:sans-serif}main{margin:90px auto;width:80%}#arc_toolbar_report{display:flex;gap:24px;align-items:center}video{width:640px;height:360px;background:#20262b}</style></head><body><main><h1>分享海报 · 视觉验收页面</h1><video></video><div id="arc_toolbar_report"><div class="toolbar-left-item-wrap"><div class="video-like">点赞</div></div><div class="toolbar-left-item-wrap"><div class="video-share-wrap">分享</div></div></div></main></body></html>'''))
    page.goto('https://www.bilibili.com/video/BV1xx411c7mD/?p=2')
    page.evaluate('''() => {
      window.GM_xmlhttpRequest = () => {throw Error('Unexpected real request')};
      const values = new Map(); window.GM_getValue=(k,f)=>values.get(k)??f;window.GM_setValue=(k,v)=>values.set(k,v);window.GM_registerMenuCommand=()=>{};
      Object.defineProperty(document.querySelector('video'),'currentTime',{value:3723});
      window.copiedText=''; window.failCopy=false;
      Object.defineProperty(navigator,'clipboard',{value:{writeText:async t=>{if(window.failCopy)throw Error('Clipboard denied');window.copiedText=t},write:async items=>{if(window.failCopy)throw Error('Clipboard denied'); window.copiedItems=items}}});
    }''')
    page.add_script_tag(content=(root/'dist/bilibili-share-poster.dev.user.js').read_text())
    page.locator('#bsp-debug-drawer summary').click()
    page.locator('[data-scenario="fixture"]').check()
    page.locator('#bsp-debug-drawer summary').click()
    assert page.locator('#bsp-entry').evaluate('(e)=>!!e.previousElementSibling.querySelector(".video-share-wrap")')
    page.locator('#bsp-entry').click()
    page.locator('.bsp-poster').wait_for()
    page.wait_for_timeout(300)
    assert page.locator('.bsp-actions > button').count()==3
    assert page.locator('.bsp-text-copy').count()==1
    for detailed, markdown in [(False,False),(True,False),(True,True),(False,True)]:
        for label,wanted in [('详细',detailed),('Markdown',markdown)]:
            button=page.get_by_role('button',name=label,exact=True)
            if (button.get_attribute('aria-pressed')=='true')!=wanted:button.click()
        page.locator('.bsp-text-copy').click()
        assert page.locator('.bsp-text-content').text_content()==page.evaluate('window.copiedText')
    page.get_by_role('button',name='Markdown',exact=True).click()
    page.locator('.bsp-panel').screenshot(path=str(out/'wide-a.png'))
    page.get_by_role('button',name='B 沉浸',exact=True).click()
    page.wait_for_timeout(250)
    assert page.locator('.bsp-preview-frame').count()==1
    page.locator('.bsp-panel').screenshot(path=str(out/'wide-b.png'))
    for width in [880,879,390,320]:
        page.set_viewport_size({'width':width,'height':844})
        page.wait_for_timeout(80)
        sizes=page.evaluate('''() => ['.bsp-panel','.bsp-controls','.bsp-workspace','.bsp-actions'].map(s=>{const e=document.querySelector(s);return [s,e.clientWidth,e.scrollWidth]})''')
        assert all(s[2]<=s[1]+1 for s in sizes),sizes
        if width==390:page.screenshot(path=str(out/'narrow-b.png'))
    page.get_by_role('button',name='时间戳',exact=True).click()
    page.wait_for_timeout(900)
    assert page.get_by_role('button',name='分P',exact=True).get_attribute('aria-pressed')=='true'
    assert page.locator('.bsp-fallback').count()==0
    assert page.locator('.bsp-b-link').text_content()=='https://b23.tv/BspDemo'
    with page.expect_download() as dl:
        page.get_by_role('button',name='下载海报',exact=True).click()
    dest=out/'export-b.png';dl.value.save_as(str(dest))
    assert struct.unpack('>II',dest.read_bytes()[16:24])==(1080,1440)
    page.evaluate('window.failCopy=true')
    page.locator('.bsp-text-copy').click()
    page.wait_for_timeout(3200)
    assert 'is-show' in page.locator('.bsp-status').get_attribute('class')
    assert 'is-error' in page.locator('.bsp-status').get_attribute('class')
    page.evaluate('window.failCopy=false')
    page.locator('.bsp-text-copy').click()
    page.wait_for_timeout(3200)
    assert 'is-show' not in page.locator('.bsp-status').get_attribute('class')
    page.emulate_media(reduced_motion='reduce')
    page.get_by_role('button',name='A 报刊',exact=True).click()
    page.wait_for_timeout(100)
    assert page.locator('.bsp-preview-frame').count()==1
    assert page.locator('.bsp-preview-frame').evaluate('(e)=>getComputedStyle(e).transitionDuration')=='0s'
    page.get_by_role('button',name='关闭分享面板').click()
    page.locator('.bsp-panel').wait_for(state='detached')
    page.locator('#bsp-debug-drawer summary').click()
    for scenario in ['cover','title','long','stats','part']:page.locator('[data-scenario="'+scenario+'"]').check()
    page.locator('#bsp-debug-drawer summary').click()
    page.set_viewport_size({'width':1280,'height':900})
    page.locator('#bsp-entry').click()
    page.locator('.bsp-cover-missing').wait_for()
    page.get_by_role('button',name='分P',exact=True).click()
    page.wait_for_timeout(900)
    assert page.locator('.bsp-qr').evaluate('(e)=>e.getBoundingClientRect().bottom<=e.closest(".bsp-poster").getBoundingClientRect().bottom-8')
    page.locator('.bsp-panel').screenshot(path=str(out/'fallback-a.png'))
    page.get_by_role('button',name='B 沉浸',exact=True).click()
    page.wait_for_timeout(100)
    page.locator('.bsp-panel').screenshot(path=str(out/'fallback-b.png'))
    page.get_by_role('button',name='关闭分享面板').click()
    page.locator('.bsp-panel').wait_for(state='detached')
    page.locator('#bsp-debug-drawer summary').click()
    for scenario in ['long','part']:
        page.locator('[data-scenario="'+scenario+'"]').uncheck()
    page.locator('#bsp-debug-drawer summary').click()
    page.evaluate("history.replaceState(history.state,'','/video/BV1xx411c7mD/?p=1');window.dispatchEvent(new Event('urlchange'))")
    page.locator('#bsp-entry').click()
    page.locator('.bsp-poster').wait_for()
    for label in ['时间戳','分P','分P']:
        page.get_by_role('button',name=label,exact=True).click()
        page.wait_for_timeout(900)
        assert page.locator('.bsp-fallback').count()==0
    assert page.get_by_role('button',name='时间戳',exact=True).get_attribute('aria-pressed')=='false'
    assert errors==[],errors
    print(json.dumps({'checks':'four text modes, three actions, crossfade, 880/879/390/320 overflow, PNG dimensions, persistent errors, dismissed success, reduced motion, placeholder and fallback','consoleErrors':errors,'artifacts':str(out)},ensure_ascii=False))
    browser.close()
