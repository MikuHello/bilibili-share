# Ticket 06 verification

Production bundle browser checks: initial dark, live light/dark, unknown retains last known, first unknown light despite system dark, modern oklab background, event payload ignored, fixed poster DOM and palette, native borderless entry remount, official share retained and menu fallback. All PASS.

RED before index/panel wiring: initial actual-page dark rendered white panel. GREEN after wiring.

Real Edge Bilibili/BewlyCat page observer probe returned light → dark → light using the actual sidebar setting. Original light state restored and temporary observer/global removed. This validates the production appearance adapter on the actual page, not installation or execution in the userscript manager. Manager version/permission acceptance remains unverified due blocked extension-management access.
