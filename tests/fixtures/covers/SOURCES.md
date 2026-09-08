# Browser test covers

These checked-in inputs keep browser tests independent of historical work items and live image downloads. They are not bundled into the userscript. Third-party image rights remain with their original owners.

| File | Video | Original source |
| --- | --- | --- |
| default.jpg | BV1TXoWBsEGc | https://i1.hdslb.com/bfs/archive/a48a609105359d30b0f7c53e12c6fee560f81507.jpg |
| BV16E8q6SE4Z.jpg | BV16E8q6SE4Z | https://i1.hdslb.com/bfs/archive/8f54269e1220f3ccc199c6efbef67b5a47ded29f.jpg |
| BV1GJ411x7h7.jpg | BV1GJ411x7h7 | https://i1.hdslb.com/bfs/archive/5242750857121e05146d5d5b13a47a2a6dd36e98.jpg |
| BV1QGbD6MEDg.jpg | BV1QGbD6MEDg | https://i2.hdslb.com/bfs/archive/ae4cccae73f3cdedb162122370323cf4f51d613b.jpg |

The files were collected during the September 2026 design passes and moved here without changing their bytes. The default image's two historical copies were identical and are now shared by the test scripts. `sources.json` retains titles and the exclusion of BV1xx411c7mD, whose transparent placeholder is deliberately not a usable-cover test case.

The BV1QGbD6MEDg case uses the design reference's title/uploader and fixed statistics (7969/170/34/313), while retaining the controlled fixture's video identity and share destination. Test statistics are not live data.
