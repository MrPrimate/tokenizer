# Tokenizer

![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads%20(Latest)&query=assets%5B0%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2FMrPrimate%2Ftokenizer%2Freleases%2Flatest)
![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fvtta-tokenizer&colorB=4aa94a)

## Quick Token Editor

Load images from:

- Your local computer (you sure have a great collection already)
- A URL (which is publicly accessible, and not using CORS)
- From D&DBeyond
- Already exists on Foundry server
- Pasting
- Drag and drop

Overlay this image by adding layers on top or beneath it.
Think of it as putting sheets of paper on top of each other, each having a different cut out, therefore showing parts of the layers beneath it and covering other areas.
You can achieve this effect by using images that are transparent in certain areas and opaque on others.

## Video Overviews

* [Asmodeah Overview](https://www.youtube.com/watch?v=IwFj4SDSXtk)

### Adjust a layer

Rotate, flip, scale, and moving the image around!

Unlock the layer by pressing the lock symbol and the layer is ready for transformation:

![Layer transformation](/docs/manipulate-layer.gif)

Move your mouse over the image, and

- **drag** to translate the image to any position you like
- **scroll your mouse wheel** to zoom in and out of the image
- **hold shift and scroll your mouse wheel** to rotate the image to your liking
- **flip** press the flip button to flip your image

### Changing the layer order

Re-order your layers by using the arrow buttons up and down.

### Setting the mask

Once you're done layering your token, you will probably want to have a mask.
This is usually a round token border frame and you want everything overflowing this frame to be transparent/removed.


![Layer masking](/docs/mask.gif)

Hit the mask button on the layer that should define the contour of your image apply this mask to every layer on your token, stamping each layer according to your frame.

**This does not work for every image!**
For every token that fails, you can provide a custom mask by creating it in the graphic editor of your choice, and upload it to Tokenizer.
Then use that as the mask for your token.
Create a transparent image and paint everything you want to be opaque later with black / white / green, whatever but **not transparent**.

### Saving the token

Click the **Okay** button to save the token to the Foundry VTT server.

### Advanced Layers

You can make characters "step out" of frames by using some of the advanced layer features.
By default Tokenizer applies a mask to all layers under it. You can also apply specific mask layers to a layer (this disables the default approach for that layer).

In addition you can edit a layers mask to add or subtract areas.

![Advanced masking](/docs/quick-dynamic-masks.gif)

In this example we:

- Add a copy of the avatar/token layer to the top of the layer pile.
- Edit the layers mask to include the snake head, pocket watch and the top of the hat.
- We then apply the mask created here to the same layer, cutting out only these masked elements, but leaving the rest of the layer transparent.
- The other layers apply masks in the usual way, but it results in the elements caught in the custom mask been placed atop the rest of the token causing a "popping" effect.

### Magic Lasso

You can use the Magic Lasso feature to remove areas of a layer you don't want, or fill with a new color.

[![Magic Lasso](/docs/magic-lasso-demo.mp4)](/docs/magic-lasso-demo.mp4)

### F.A.Q.

#### The Tokenizer does not open when clicking on the avatar image

You need to have the right permission to upload things onto the Foundry VTT server.
GMs and Assistants do have the required permission by default, but regular Players don't.

Ask your GM to check the player settings (hit `ESC`, then select `Configure Players` from the appearing menu).
Every player that will use the Tokenizer requires the **Trusted Player** permission.

#### I don't want to open Tokenizer!

You can "shift click" on the avatar to open the regular file picker instead.
Uf you

#### The tokens are not saving!

Two things are required for Tokenizer to being able so save a token.

1. The Foundry VTT server needs to allow the **Trusted Players** to upload images to the server.
Check this setting in the `Game Settings`, you will find the setting `Allow Trusted Players Upload` at the top, please check that.

2. You will need to check the setting `Upload directory` in the Tokenizer section of the `Game Settings`.
Make sure that Foundry can write to this directory, this is best achieved through creating it in the filepicker.

#### I can't load files from some URL's

Many sites implement a protocol called CORS to help protect users from malicious attacks.
Some examples of the errors you get back are in issue #26.

If you want to load images from one of these sites you can use your own proxy.

[This image-proxy](https://github.com/VTTAssets/image-proxy) is a good starting point.

Get the proxy running then open your web browser development console (F12) in a Foundry session and run:

```
game.settings.set("vtta-tokenizer", "proxy", 'http://localhost:4001/%URL%?access_token=MY_SECRET_ACCESS_TOKEN');
game.settings.set("vtta-tokenizer", "force-proxy", true);
```

Replace the `http://localhost:4001` with your proxy end point, and the `MY_SECRET_ACCESS_TOKEN` with your chosen access token.

#### Where can I get more frames?

* [This is a good starter pack](https://www.dmsguild.com/product/268503/ADs-Starter-Token-Frame-Set)
* There are some different colour variations [here](https://drive.google.com/file/d/1VQvl2GA6SXuGMTY8hgsb1A2De4fSVRIT/view)
* You could convert some of the [frames](https://github.com/RPTools/TokenTool/tree/main/other-resources/Overlay%20Templates) from TokenTool using [GIMP](https://www.gimp.org/)
* There are some nice frames [here](https://github.com/jcolson/token_frames) and this is also a [module in Foundry](https://foundryvtt.com/packages/token-frames). If this module is active tokenizer will load the frames into the frame view by default. You can disable this in Tokenizer settings.

## Old Mighty Friendly Gamer Frames

This work under these folders is licensed under a [Creative Commons Attribution-NonCommercial 3.0 Unported License](http://creativecommons.org/licenses/by-nc/3.0/).

This is a sample of frames available from OMFG, and plenty more are available.

You can support the OMFG on [KoFi](https://ko-fi.com/oldmightyfriendlygamer) and [Patreon](https://patreon.com/omfg).


## Calling Tokenizer

Tokenizer is exposed through `window.Tokenizer` or `game.modules.get("vtta-tokenizer").api`

You can call Tokenizer by using `window.Tokenizer.launch(options, callback)` or `window.Tokenizer.tokenizeActor(actor)`.

Options can consist of:

```javascript
{
  name: "Testy McTestFace",
  type: "pc",
  avatarFilename: "uploads/tokenspc/testy_mctestface.Avatar.webp?1626284544960",
  tokenFilename: "uploads/tokenspc/testy_mctestface.Token.webp?1626284544960",
  targetFolder: "[data] uploads/tokens/my-special-folder",
  disposition: 1,
  nameSuffix: "any-string",
}
```

Only `name` is required, the others will use Tokenizer defaults.

The `targetFolder` can override the default save folder.

The `nameSuffix` will add this to the token name as a suffix.

As well as any other object you wish to be passed back to the callback function.

e.g. 

```javascript
let tokenizerOptions = {
  name: "test",
  avatarFilename: "uploads/example/example_avatar_image.png",
  targetFolder: "[data] uploads/tokens/special",
  usefulString: "Useful data"
};

game.modules.get("vtta-tokenizer").api.launch(tokenizerOptions, (response) => {console.log(response)});
```

When the OK button is pressed it will return the following to the function (which in this case prints it to the console):

```javascript
{
  name: "test",
  avatarFilename: "uploads/tokens/special/test.Avatar.webp",
  targetFolder: "[data] uploads/tokens/special",
  tokenFilename: "uploads/tokens/special/test.Token.webp",
  usefulString: "Useful data"
}
```

This is useful if you want to generate tokens for use outside of the regular actors.

If you want to tokenize just a scene token then you need to call `tokenizeSceneToken` passing in a doc with an `actor` and `token` object:

```javascript
const dragon = canvas.scene.tokens.find(t => t.name === "Adult Black Dragon");
game.modules.get("vtta-tokenizer").api.tokenizeSceneToken({ token: dragon, actor: dragon.actor });
```


## How to I call auto Tokenize?

This applies the default frame to the current token image.

Call it using `window.Tokenizer.autoToken` passing in an `Actor` as the only variable.

```javascript
let actor = game.actors.getName("TEST");
await game.modules.get("vtta-tokenizer").api.autoToken(actor);
```

This will apply the token, upload the image and update the actor.

You can pass in override options in an `options` map as the second argument:

```javascript
await game.modules.get("vtta-tokenizer").api.autoToken(actor, { nameSuffix: "-name-suffix" });
```

## How can I auto Tokeize all selected tokens on a scene?

The following macro will tokenize all the selected tokens on a scene using your default settings.

```javascript
for (const t of canvas.tokens.controlled) {
  await game.modules.get("vtta-tokenizer").api.autoToken(t);
}
```


# Can I reset all the settings to defaults?

```javascript
game.settings.settings.forEach((s) => {
  if (s.namespace !== "vtta-tokenizer") return;
  game.settings.set(s.namespace, s.key, s.default);
});
```
