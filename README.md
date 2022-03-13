# VTTA Tokenizer
## Token creation made easy

 You have many options:

- Load an image from your local harddrive (you sure have a great collection already)
- Load an image from any URL (which is publicly accessible, and not using CORS)
- Load an image from D&DBeyond
- Load an image already uploaded to the Foundry server
- Paste an image
- Drag and drop an image

Overlay this image by adding layers on top or beneath it.
Think of it as putting sheets of paper on top of each other, each having a different cut out, therefore showing parts of the layers beneath it and covering other areas.
You can achieve this effect by using images that are transparent in certain areas and opaque on others.

### Adjust a single layer

Rotating the image, scaling the image, or moving the image around are common requirements.

First, unlock the layer by pressing the lock symbol and the layer is ready for transformation:

![Layer transformation](/docs/manipulate-layer.gif)

Move your mouse over the image, and

- **drag** to translate the image to any position you like
- **scroll your mouse wheel** to zoom in and out of the image
- **hold shift and scroll your mouse wheel** to rotate the image to your liking

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
* There are some nice frames [here](https://github.com/jcolson/token_frames)

## Calling Tokenizer

You can call Tokenizer by using `Tokenizer.launch(options, callback)` or `Tokenizer.tokenizeActor(actor)`.

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

window.Tokenizer.launch(tokenizerOptions, (response) => {console.log(response)});
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

