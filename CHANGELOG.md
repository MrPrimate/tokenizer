# Changelog

# [4.5.6]

- Resolve some issues with tokenrings and wildcard tokens.

# [4.5.5]

- Italian translation updates by GregoryWarn

# [4.5.4]

- pt-BRT updates by Kharmans.
- Correct asterisk setting typo.

# [4.5.3]

- If opening a wildcard token, several default layers would not be added.
- Add character sheet context menu option in v13.
- A reset token scaling, and force disable dynamic token ring setting is now available. Useful to check if you are editing tokens that have been created with Art/Token packs such as the excellent Pathfinder Token modules.
- A "Check for Wildcard asterisk?" setting introduced which will check for the presence of wildcard asterisk symbol in the token name if iswildcard is checked, and if not found will treat as normal token. Useful to check if you are editing tokens that have been created with Art/Token packs such as the excellent Pathfinder Token modules.

# [4.5.2]

- In v13 linked tokens edited from the canvas did not update the image on the canvas.

# [4.5.1]

- Some CSS corrections for changes in v13 that broke some UI elements.

# [4.5.0]

- This version of Tokenizer requires Foundry 12 or higher.
- Fixes for custom name picker not working on v13.

# [4.4.4]

- Updates for v13 context menu changes.

# [4.4.3]

- Italiano translation by @ GregoryWarn (Thank you)

# [4.4.2]

- Update pt-BR.json
- Fix a bug where the texture layer would be tinted neutral if set to apply on opening tokenizer.

# [4.4.1]

- Remove debug statement.

# [4.4.0]

- Support v13 of Foundry.
- Add option to append actor id to filename when editing the prototype token.

# [4.3.16]

- Prevent warning in install screen about author field.

# [4.3.15]

- Fix a incompatibility issue with Youtube Widget

# [4.3.14]

- If using dynamic token rings save token image to dynamic texture field as well as token field to allow proper scaling for grid scaled rings.

# [4.3.13]

- Add some mask templates for grid scale dynamic rings.

# [4.3.12]

- When using the compendium search functions in pf2e right click on actor would fail.

# [4.3.11]

- When bypassing Tokenizer to use the Filepicker, s3 paths would not open location properly.

# [4.3.10]

- PT-BR language translation updates for v4.3.9.
- Layer cloning will now preserve lasso changes.

# [4.3.9]

- Fix for quick settings not always applying.
- Setting to enable dynamic token ring settings when saving a tokenizer token.

# [4.3.8]

- Enable Português (Brasil) in manifest :facepalm:

# [4.3.7]

- Use image offset when just using a masking layer.

# [4.3.6]

- The Modify avatar checkbox would not respect the settings default when opening tokenizer.

# [4.3.5]

- Translation updates for Brazilian Portuguese and Japanese.

# [4.3.4]

- PT-BR language translation updates for v4.3.3.
- Add Quick Settings for quickly choosing the layers you want to add when opening tokenizer.

# [4.3.3]

- You can now add a mask layer - this will use the image as a mask layer taking all the non transparent pixels as the mask. Provided are two default masks, which helpfully match the size of the new dynamic ring provided in D&D 5e v3 and Foundry v12.

# [4.3.2]

- PT-BR language translation updates.

# [4.3.1]

- Fix an issue with auto-tokenizer with v4.3.0

# [4.3.0]

- Support for v12 of Foundry
- Improved clearing of pop up selectors (e.g. mask controls)

# [4.2.13]

- Kgar Tidy 5e sheet merge into Tidy Sheet support
- 5e v3.0.0 Tokenizer will open regardless of if avatar or token is selected when editing the sheet.

# [4.2.12]

- Kgar Tidy 5e sheet support

# [4.2.11]

- Support for 3.2.0+ of Coriolis system.

# [4.2.9] [4.2.10]

- JA language updates from doumoku
- Slight tweaks t allow the Tokenizer menu to appear if player has permissions on actors tab.

# [4.2.8]

- Slight CSS corrections for if using custom themes.

# [4.2.7]

- When using OSE (and possibly other systems) when using shift to open the file picker instead of Tokenizer the dialogue would not open.

# [4.2.6]

- Non-ray masking algo would not work.
- Support NPC's that are a PC type in Forbidden Lands system.

# [4.2.5]

- Fixes #132: When a token frame is uploaded via the upload button rather than the find frame button the apply default mask button would not work.

# [4.2.4]

- Fixes for systems such as Gumshoe system where PC's type is marked slightly differently in the data model.

# [4.2.3]

- Scale layer option - you can now scale a layer by a percentage.

# [4.2.2]

- You can now select a "texture layer" and optional tint color to apply to a new token, under the token layer.
- A Centre Layer button now exists to allow you to centre the layer. Useful if you have resized/zoomed and it has skewed.
- Centre Layer, Reset Layer and Flip Layer moved to a Layer Movement Controls popup section. 

# [4.2.1]

- Fixes for Creating folders in v11.302 due to changed status codes from Foundry.

# [4.1.4]

- Custom Masking would not respect deletes once the initial edit had been made.

# [4.1.3]

- Fix an issue where wildcard paths for tokens that did not include a file extension could not save.

# [4.1.2]

- Masks would be produced for non-border layers by default, and it was not possible to remove these default masks when editing a layer mask.

# [4.1.0/4.1.1]

- Clone layer button.
- You can now choose to apply a color tint to the default token frame. Select this option in the settings if you wish to have it applied by default. This allows you to use the same frame, but with different colors for PC's, hostile, neutral and friendly tokens.
- Some new default tokens for use with the tint layer option.
- A new "Magic Lasso" feature allowing you to replace similar colors with transparent areas or a color.
- Fixed an error that appeared when clicking the Tokenizer link in the title bar.

# [4.0.3]

- Improved use of localisation.
- You can now make similar colours in a layer disappear/become transparent pixels.
- Mask layers and transparent pixels can now be reset independently.
- Colour dropper layer colour pick now respects scaled canvas and will select colour under the mouse.

# [4.0.2]

- Mask editor: improve performance of editing large images.
- Make brush size change feel more fluid.
- Right click remove mask in editor did not work if you did not move the mouse.
- Clicking on the add layer icon would close Tokenizer. #126

# [4.0.1]

- Mask editor - masks can now be edited, note once edited the masks cannot be moved and will remain static if the image on the layer is moved.
- Select which masks you would like applied to each layer to create fun effects like stepping out of a frame! See https://github.com/MrPrimate/tokenizer/blob/master/docs/multi-layers.webm
- Blend modes can be selected for intial layer draw and for mask drawing.
- Some UI improvements suggested by @Mats (Allistaar)#9836

# [3.11.1]

- In some circumstances when layers were removed
- Colour layers would not change 

# [3.11.0]

- Download image, as requested as part of #113
- Tighten up permissions to prevent Tokenizer launching if user lacks required permissions #114
- Huge performance of dragging/resizing mask layers.
- Basic first pass implementation: Multiple masks can now be applied.
- Mask images can now be hidden.
- Added blend mode support, see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation and https://www.w3schools.com/tags/canvas_globalcompositeoperation.asp for details.


# [3.10.2]

* Exposed API functions via `game.modules.get("vtta-tokenizer").api` as well as `window.Tokenizer`
* More frames from TheGreatNacho.

# [3.10.1]

* Small version bump to enforce version constaints on v9.

# [3.10.0]

* This version of tokenizer is only compatible with version 10 of Foundry.
* Tokenizer will now open when clicking the character in the Coriolis system.

# [3.9.5]

* Tokenize Compendium function would place images in the root directory.
* Auto-tokenize function would not respect image locations.

# [3.9.4]

* Can now change the save location and name for a specific toke or avatar on the Tokenizer screen.
* The actors image could get a very long file name in some situations.
* In v10, scene edited tokens would not be updated.

# [3.9.3]

* Can change directory/default frames again in v10.

# [3.9.2]

* v10 bug: update tokens on scene did not work
* Improve DDB support.

# [3.9.1]

* Fix for Token Variants API @dirusulixes#6754

# [3.9.0]

* v10 support
* auto tokenize did not respect the offset values in settings

# [3.8.6]

* Fix typo in settings label.

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
