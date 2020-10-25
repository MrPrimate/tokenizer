# VTTA Tokenizer

This is a temporary fork to maintain compatibility with Foundry v0.7.5 till Sebastian returns from absence.

![](https://img.shields.io/badge/Foundry-v0.4.0-informational)

Your players identify with their characters and a token represents their character - it should look awesome. Tokenizer is there to help.

## Token creation made easy

One of the primary goals of everything I develop is: Make it easy to use, and do not overburden the user with features. Therefore, uploading your base images, that is: your layers, is really simple. You have three options:

- Load an image from your local harddrive (you sure have a great collection already)
- Load an image from any URL (which is publicly accessible, this module can't hack into NASA, sorry)
  or
- just select an image already uploaded to the Foundry server

Overlay this image by adding as many layers on top or beneath it, think of it as putting sheets of paper on top of each other, each having a different cut out, therefore showing parts of the layers beneath it and covering other areas. You can achieve this effect by using images that are transparent in certain areas and opaque on others.

You can play around with a Tokenizer version on this website, which is working all the same as the in-game editor, besides being able to save the image to your Foundry server (I still can't hack, remember?). You head [over to the Tokenizer Tool page](/tools/tokenizer) and have a look.

### Adjust a single layer

Adjusting, that means: rotating the image, scaling the image or moving the image around, is really easy, too: Just unlock the layer by pressing the lock symbol and you see that is this layer is unlocked and ready for your transformation:

![Layer transformation](/img/asset/vtta-tokenizer/layer-transformation.gif)

Just move your mouse over the image, and

- **drag** to translate the image to any position you like
- **scroll your mousewheel** to zoom in and out of the image _or_
- **hold shift and scroll your mousewheel** to rotate the image to your liking

### Changing the layer order

You added a tint that is overlaying the token frame, too? Don't worry, just re-order your layers by using the tiny arrow buttons up and down until everything looks great.

![Layer ordering](/img/asset/vtta-tokenizer/layer-ordering.gif)

### Setting the mask

Once you are done layering your token, you will want to have a mask, probably. E.g. you have that nice, round token border frame that came with the module, or from your own collection, and you want everything overflowing this frame to be transparent, to be gone.

I got you.

![Layer masking](/img/asset/vtta-tokenizer/layer-masking.gif)

Just hit the mask button on the layer that should define the contour of your image and the magic happens: A very neat algorithm creates an automatic mask and applies this mask to every layer on your token, correctly stamping each layer according to your frame.

**Does this work for every image?** No, it doesn't. For every token that fails, you can provide a custom mask by creating it in the graphic editor of your choice, and upload it to Tokenizer, then use that as the mask for your token. Just create a transparent image and paint everything you want to be opaque later with black / white / green, whatever but **not transparent** and it will work correctly. Give it a try!

### Saving the token

Just hit the **Okay** button to save the token to the Foundry VTT server.

### F.A.Q.

#### The Tokenizer does not open when clicking on the avatar image

You need to have the right permission to upload things onto the Foundry VTT server. GMs and Assistants do have the required permission by default, but regular Players don't.

So ask your GM to check the player settings (hit `ESC`, then select `Configure Players` from the appearing menu). Every player that will use the Tokenizer requires the **Trusted Player** permission.

#### The tokens are not saving!

There are two things required for Tokenizer to being able so save a token.

1. The Foundry VTT server needs to allow the **Trusted Players** to upload images to the server. Check this setting in the `Game Settings`, you will find the setting `Allow Trusted Players Upload` at the very top, please check that.

2. You will need to check the setting `Upload directory` in the VTTA Tokenizer section of the `Game Settings`. The entry here depicts a sub-directory of `[Foundry Directory]/ressources/app/public`, so e.g. if you inserted `public/img`, then Tokenizer would look for a directory `[Foundry Directory]/ressources/app/public/public/img` which is probably wrong. So, please check this setting throurougly if you change it from the default.
