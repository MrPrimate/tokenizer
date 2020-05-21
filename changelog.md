# Changelog

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
