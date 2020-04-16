# Changelog

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
