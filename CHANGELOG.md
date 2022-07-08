# Changelog

# [3.8.5]

* An option to auto-crop images by elizeuangelo

# [3.8.4]

* Some very specific images sizes would cause recursive loops and run away memory usage.

# [3.8.3]

* Masking now attempts to use rays and Bresenhams line algorithm to improve mask detection, you can switch back to the old algorithm in the settings if it doesn't work out for you.
* Each layer can now have an Opacity/Alpha applied to it.
* Mask Browser did not always handle S3 URLS correctly.

# [3.8.2]

* Auto Tokenize zoomed in too much.

# [3.8.1]

* Mask detection had broken on more complicated frames where it previously worked.

# [3.8.0]

* Masking now applies only to lower layers.
* Token only modification now defaults to True.
* Zooming in on images should now upscale to the provided images native resolution rather than capped at the saved images resolution.
* Colour tinting is now specific to new "color layers", it will add a colour layer by default, using the default background color. This can be disabled in teh Tokenizer settings. This allows tokens with transparent middles.
* If there are any CSS gurus who are begging to help fix some of the slight wonkyness on the controls, please help :)

# [3.7.3]

* When setting a default token frame Tokenizer will offset an image and scale it by a default value. You can configure this in the default settings. It's currently set to match the default rings. This allows tokenizer to fit more of your image in the ring when tokenizing, and useful for the Auto-Tokenize operations.
* Flip/mirror option added for layers.

# [3.7.2]

* Tokenizer will load the frames provided by the [Token Frame](https://foundryvtt.com/packages/token-frames) module by default into the Tokenizer frame selector if the module is active. You can disable this in the Tokenizer settings. Thanks @blackntan#0069 for putting a great collection together.

# [3.7.1]

* Auto tokenize will now return the path of the updated image, and actor update is optional.

# [3.7.0]

* Auto Tokenize function added for use by other modules.
* You can right click on an Actors Compendium and auto-tokenize all actors in that compendium.
* File upload will now hide UI notifications in v9.

# [3.6.8]

* Option to disable OMFG frames appearing in the frame select dialogue.

# [3.6.7]

* Actually fix Token Variant Art API.

# [3.6.6]

* Support new Token Variant Art API for image select button.

# [3.6.5]

* Typo in settings.
* Log level not respected.
* User level override for switching shift-click/default filepicker/tokenizer behaviour?

# [3.6.4]

* try and improve tokenizer opening speed.

# [3.6.3]

* @OldMightyFriendlyGamer#0832 a thinner token ring set added.
* Recursive search of folder frame directory for custom frames.
* Filter out non images from folder frames directory.

# [3.6.2]

* Frames with spaces in name did not show in the viewer correctly.
* Removed some dead code causing harmless console errors.
* Tokenizer now looks for `data-edit="img"` on the character sheet, rather than a list of known classes used by avatars. This is used by the filepicker for images, so should allow Tokenizer to work on most systems without modification.

# [3.6.0/3.6.1]

* Tokenizer frame selection is now a GUI
* A large collection of frames provided by @OldMightyFriendlyGamer#0832 - more available at https://ko-fi.com/oldmightyfriendlygamer

# [3.5.5]

* Tokenizer can now take a default frame for non hostile NPCs.

# [3.5.4]

* Tokenizer token-only mode default is a now a per player setting you can change in the Tokenizer module settings.

# [3.5.3]

* Tokenizer would not open for players with the new generate token only option.

# [3.5.1]

* Tokenizer now will only generate token instead of a token and a duplicate avatar pic (togglable).

# [3.5.0]

* Tokenizer now has context menu items for calling tokenizer and updating all actor tokens on the current scene.

# [3.4.13/14]

* v9 support

# [3.4.12]

* Moulinette filepicker on the forge did not work.

# [3.4.11]

* If token on the canvas had been copied to the clip-board a paste of an image would also paste the token.

# [3.4.10]

* Load from URL failed on Avatar (typo)

# [3.4.9]

* Copy from Token to Avatar available.
* Center layer renamed to reset layer to better reflect function.

# [3.4.8]

* When using S3 on some setups using Chrome, a CORS error could appear when trying to load tokens that are saved to S3 storage.

# [3.4.7]

* Add shift click for avatar if you disable open on click for avatar.

# [3.4.6]

* You can disable Tokenizer opening when clicking the avatar in the modules settings. If this is selected it will fall back to the default file picker.

# [3.4.5]

* Tokenizer will now update placed scene tokens again in 0.8.x. Tokens edited on the scene canvas will remain unique for that placed token. e.g. if you update 1 of 10 placed goblins it will only update that single goblins token image.

# [3.4.4]

* S3 CORS access was broken.

# [3.4.3]

* Improve custom CORS proxy support.

# [3.4.2]

* Restore regular paste functionality after tokenizer was opened.

# [3.4.1]

* You can now choose to paste/drag n drop to the avatar or token via button switch.

# [3.4.0]

* You can now drag and drop or paste images into Tokenizer. This will target the token side only.

# [3.3.5]

* Fix borken image load from sites with appropriate CORS policy.

# [3.3.4]

* Adds `Tokenizer.tokenizeActor()`.

# [3.3.3]

* Assets in your Forge library will load again.

# [3.3.1]

* Overhaul of code base to and implementation against by linting standard.
* Added default token directories and auto-create
* BREAKING: `Tokenizer.launch()` has changed to allow Tokenizer to be called without an actor. See readme.md for examples.

# [3.2.6]

* Default layer fill colour for transparent images is now white rather than black, and this can be changed in the settings. ( @NH23#0868 )
* Tokenizer can now be launched using `Tokenizer.launch(actor)`.

# [3.2.5]

* Unable to add layers if "add frame to the token when opened" option was unchecked.

# [3.2.4]

* Some users experienced issues with name rendering of frame drop down.

# [3.2.2/3]

* Frames drop down is now fixed width.

# [3.2.1]

* Option to place Tokenizer button on title bar.
* Option to turn off auto add frame in settings.
* Option to specify a directory to use as frames.
* Drop down will present available frames to apply to a token.

# [3.1.5/6]

* File names are now converted to ascii to deal with Foundry unicode filename issues. It will revert to hash of character name if a suitable string cannot be generated.

# [3.1.3/4]

* Add a button to load token image from Token Variants module.

# [3.1.2]

* Japanese localisation (Thanks BrotherSharper and asami )

## [3.1.1]

* Support for saving files as webp as default. (PNG is still available in settings). (Thanks JamzTheMan !)
* Image size is now an option. (Thanks JamzTheMan !)

## [3.1.0]

* Support for Foundry v0.8.3
* Can upload NPC tokens to a seperate folder to PC's.


## [2.2.1]

### Added

- Certified Foundry 0.6.4 compatibility
- pt-BR localization thanks to rinnocenti

### Changed

- Appending current date to filenames in order to refresh the browser cache for changed images

## [2.2.0] Wild things

This release adds wildcard support to Tokenizer - well, kinda. Tokenizer is due to a rewrite, but is currently last in place on my backlog, right after the map creation of the D&D Beyond battlemaps and the Iconizer Icon-renaming party, so it will be a while. In the meantime, enjoy this little addition:

- Go to your _Prototype Token_ panel from your Actor's sheet.
- Go to _Image_
- Enable _Randomize Wildcard Images_
- No need to adjust the _Token Image Path_: If it does not yet contain a wildcard asterisk, Tokenizer will create an appropriate one for you based on the directory you defined as an Avatar/Token upload directory.

  Alternatively, you can specify a complete path containing an asterisk, which may deviate from your chosen setting, but make sure that it is pointing to your User Data storage pool, other storage pools are not supported

- Update Token, then open up Tokenizer
- You will see that the Token heading on the right has an added _(Wildcard)_ next to it - Wildcard-mode is enabled
- In the footer, next to the OK button, you will see the generated filename based on either your entry in _Token Image Path_ or the generated one: `Actorname.Token-[nnn].png`. All asterisks will be replaced by a 3-digit number.

Examples:

- Token Image Path: `uploads/my-token-*.png` -> `uploads/my-token-001.png`, `uploads/my-token-002.png`, `uploads/my-token-003.png`, ...
- Token Image Path: `my-token-*.png` -> `my-token-001.png`, `my-token-002.png`, `my-token-003.png`, ...
- Token Image Path: `uploads/my-*-token-*.png` -> `uploads/my-001-token-001.png`, `uploads/my-002-token-002.png`, `uploads/my-003-token-003.png`, ...

**FAQ**

- _When opening Tokenizer, the Token view is just black_ Since there might be not only one, but many Tokens already in place, just the default Token border is loaded each time you open up Tokenizer
- _How can I use that to batch-create Tokens?_ Open up Tokenizer as often as you'd like. The underlying design does not allow a better workflow, which might be implemented in the rewrite
- _What if I delete one token?_ The target filename is generated by querying the Foundry server for existing files matching the _Token Image Path_. It then counts up until it finds the next free number. So if you have 20 Tokens and delete No. '018', the next created token will have the number '018' to fill that slot, and will then continue to use '021' as the next free token.
- _Why can't I use S3?_ Support may be added on the rewrite, or when Foundry supports it in vanilla. This is not a promise.

### Fixed

- Compatibility to Foundry 0.6.1
- Removed Settings Extender and replaced it with a custom implementation
- Auto-adjusting window height on startup

## [2.1.4] Hotfix

### Added

- CSS selector 'player-image' to support pathfinder 2E (again)
- Certified compatibility for Foundry 0.6.0

## [2.1.3] ALL THE PIXELS

### Fixed

- No more distortions when selecting pixel sizes > 400 in the game settings
- Existing Avatar images retain their original (squared) image dimensions they have, even after editing with Tokenizer. That means you can
  - Hold SHIFT while clicking on your Avatar image to upload an Avatar of your choice and or your desired resolution
  - After setting your Avatar image, click **again** on your Avatar, this time do not hold shift to open up Tokenizer
  - Your Avatar image area will have the dimensions of your original image, your Token image area will have the dimensions set in your game settings

## [2.1.2] Foundry 0.6.6 compatibility release

No changes

## [2.1.1]

### Added

- Holding SHIFT while clicking on your avatar image opens up the default Filepicker instead of Tokenizer. This can be used to reset the avatar image to high-res images after creating a token

## [2.1.0] Storage Galore

### Added

- Support for S3 as a storage target

## [2.0.7] Hotfix

- Disabled buttons if browsing for files is disabled

## [2.0.5] Hotfix

### Fixed

- Migrated the check for the permission to upload files to the new permission system, displaying a notification of the permission is not granted

## [2.0.4] Foundry 0.5.5 compatibilty release

**Note**: This release is available for 0.5.5 and up only.

### Fixed

- Repairing corrupted game settings now in `ready` to avoid throwing errors for incorrectly using the uninitialized ui.notifications

## [2.0.3] Foundry 0.5.4 compatibilty release

### Added

- Tooltips provided by @mtvjr

## [2.0.2] Foundry 0.5.3 compatability release

### Changed

- Set compatibleCoreVersion to 0.5.3

## [2.0.1]

### Added

- Added the `img.img-profile` CSS class to the supported Avatar image classes that Tokenizer hooks into. In total `img.sheet-profile`, `img.profile` and `img-profile-img` are the image CSS classes that Tokenizer will hook into on rendering character sheets (please, Atropos, stop chaging the CSS classnames in Simple World Building system ;)

## [2.0.0]

Feature parity release for the relaunch of VTTAssets

## [1.0.16]

### Added

- Support for Foundry VTT 0.4.4

### Removed

- Support for Foundry VTT 0.4.3 and lower

## [1.0.15] - 2020-01-02

### Added

- Used [Azzurite's Settings Extender](https://gitlab.com/foundry-azzurite/settings-extender) to simplify configuration

### Fixed

- Default frame for NPC referenced the PC frame

### Removed

- System list in module.json in order to enable in all compatible systems

## [1.0.14] - 2019-12-22

### Fixed

- Actors with a slash in it's name successfully broke the image upload

### Changed

- Adjusted the upload path issue to work in all 0.4.x versions, resulting in a minimum core version back to 0.4.0

## [1.0.13] - 2019-12-20

- Fixed upload directory due to a Foundry change

## [1.0.12] - 2019-21-11

### Added

- Default frames configuration setting for NPCs and PCs (thanks to the wonderful [settings extender](https://gitlab.com/foundry-azzurite/settings-extender) by @AzzuriteTV)

## [1.0.11] - 2019-21-11

### Changed

- Switched to my own CORS proxy to speed up loading times. Whoever may be tempted: Please do not abuse the server, or I will need to take it offline - thank you for your understanding
- Updated german translation to be consistent across modules
- Updated readme

## [1.0.10] - 2019-21-11

### Fixed

- Several fixes required for 0.4.0 compatiblity

### Changed

- Rewrote module as ES6 module

## [1.0.0] - 2019-20-11

### Added

- Initial release

### Removed

- Support for Foundry v0.3.9 and prior
