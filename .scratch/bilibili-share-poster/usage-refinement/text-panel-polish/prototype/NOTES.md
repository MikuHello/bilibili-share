# THROWAWAY — text panel layout study

Question: how should the text and export controls use the right-hand column without excess empty card space or a reserved 64px feedback gutter?

Run from repository root:

```sh
python3 -m http.server 8778 --bind 127.0.0.1 --directory .scratch/bilibili-share-poster/usage-refinement/text-panel-polish/prototype
```

Open http://127.0.0.1:8778/?variant=B . A preserves current geometry; B uses content height, adjacent exports and a vertically centered stack; C moves image exports below the image and text-copy actions below the text. Arrow controls and keyboard switch variants; dark mode, long title and detail level can be compared. These are layout-only controls; no actual clipboard, download or remote write occurs.

The production panel was captured from the controlled browser fixture. Poster bitmap is the already verified real-cover fixture with controlled video identity/counts, not live metadata. The text shows the owner's requested example format and snapshot counts. No poster styling is changed here. The prototype control bar and responsive shell are not product UI.

The source and visual evidence are archived on codex/text-panel-prototype, separate from production. Reimplement any chosen design cleanly after visual confirmation.
