# VTTA Tokenizer
## Token creation made easy

 You have many options:

- Load an image from your local harddrive (you sure have a great collection already)
- Load an image from any URL (which is publicly accessible, and not using CORS)
- Load an image from D&DBeyond
- Load an image already uploaded to the Foundry server
- Paste an image
- Drag and drop an image

Overlay this image by adding layers on top or beneath it, think of it as putting sheets of paper on top of each other, each having a different cut out, therefore showing parts of the layers beneath it and covering other areas. You can achieve this effect by using images that are transparent in certain areas and opaque on others.

### Adjust a single layer

Rotating the image, scaling the image, or moving the image around is easy:  unlock the layer by pressing the lock symbol and the layer is unlocked and ready for your transformation:

![Layer transformation](/docs/manipulate-layer.gif)

Move your mouse over the image, and

- **drag** to translate the image to any position you like
- **scroll your mousewheel** to zoom in and out of the image _or_
- **hold shift and scroll your mousewheel** to rotate the image to your liking

### Changing the layer order

You added a tint that is overlaying the token frame, too? Don't worry, re-order your layers by using the arrow buttons up and down until everything looks great.

### Setting the mask

Once you're done layering your token, you will probably want to have a mask. This is usually a round token border frame and you want everything overflowing this frame to be transparent/removed.


![Layer masking](/docs/mask.gif)

Hit the mask button on the layer that should define the contour of your image apply this mask to every layer on your token, stamping each layer according to your frame.

**Does this work for every image?** No, it doesn't. For every token that fails, you can provide a custom mask by creating it in the graphic editor of your choice, and upload it to Tokenizer, then use that as the mask for your token.
Create a transparent image and paint everything you want to be opaque later with black / white / green, whatever but **not transparent** and it should work. Give it a try!

### Saving the token

Click the **Okay** button to save the token to the Foundry VTT server.

### F.A.Q.

#### The Tokenizer does not open when clicking on the avatar image

You need to have the right permission to upload things onto the Foundry VTT server. GMs and Assistants do have the required permission by default, but regular Players don't.

Ask your GM to check the player settings (hit `ESC`, then select `Configure Players` from the appearing menu). Every player that will use the Tokenizer requires the **Trusted Player** permission.

#### The tokens are not saving!

Two things are required for Tokenizer to being able so save a token.

1. The Foundry VTT server needs to allow the **Trusted Players** to upload images to the server. Check this setting in the `Game Settings`, you will find the setting `Allow Trusted Players Upload` at the top, please check that.

2. You will need to check the setting `Upload directory` in the Tokenizer section of the `Game Settings`. The entry here depicts a sub-directory of `[Foundry Directory]/resources/app/public`, so e.g. if you inserted `public/img`, then Tokenizer would look for a directory `[Foundry Directory]/resources/app/public/public/img` which is probably wrong
 Please check this setting if you change it from the default.

#### Where can I get more frames?

* [This is a good starter pack](https://www.dmsguild.com/product/268503/ADs-Starter-Token-Frame-Set)
* There are some different colour variations [here](https://drive.google.com/file/d/1VQvl2GA6SXuGMTY8hgsb1A2De4fSVRIT/view)
* You could convert some of the [frames](https://github.com/RPTools/TokenTool/tree/main/other-resources/Overlay%20Templates) from TokenTool using [GIMP](https://www.gimp.org/)

## Calling Tokenizer

You can call Tokenizer by using `Tokenizer.launch(options, callback)` or `Tokenizer.tokenizeActor(actor)`.

Options can consist of:

```javascript
{
  name: "Testy McTestFace",
  type: "pc",
  avatarFilename: "uploads/tokenspc/testy_mctestface.Avatar.webp?1626284544960",
  tokenFilename: "uploads/tokenspc/testy_mctestface.Token.webp?1626284544960",
  targetFolder: "[data] uploads/tokens/my-special-folder"
}
```

Only `name` is required, the others will use Tokenizer defaults.

The `targetFolder` can override the default save folder.

As well as any other object you wish to be passed back to the callback function.

e.g. 

```javascript
let tokenizerOptions = {
  name: "test",
  avatarFilename: "uploads/example/example_avatar_image.png",
  targetFolder: "[data] uploads/tokens/special",
  usefulString: "Useful data"
};

Tokenizer.launch(tokenizerOptions, (response) => {console.log(response)});
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

