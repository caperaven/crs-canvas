## Getting started

1. Make sure you have created your icons in iconmoon (https://icomoon.io/app/)
2. you should be able to import the set from the "resources/fonts/icons" folder
3. make sure that when you have finished with editing the icons you save the fonts including the json file to the same folder

## Generating the texture

You will need to do two things.

1. create a charset.text file in font folder.
2. execute the generation command

msdf-atlas-gen -type sdf -font .\icons.ttf -json icons_font.json -format png -imageout icons_font.png -charset charset.txt -size 32

When creating the charset.text file note that on the font there is a code like "e900".  
Your charset.text file is a space seperated file where the value is a hex value where you add "0x" before the code.  
For example "e900" in charset.txt is "0xe900"

Once you have created the carset.txt and run the command you should have a icons_font.jons and png file

## Crating the end result

1. copy the "icons_font.png" file to "/assets/textures/icons_font.png"
2. copy the "json_font.json" to "/build/font-files" and turn it into a js file exporting it as "export const font = {...}"

Your json_font might be minified so you can reformat the code using your ide "code" tools.
You may notice that the unicodes generated by msdf seems a bit random and changes.
At this point you might want to replace the unicode property in the icons_font.js to something more manageable such as the name of the icon.

## creating the UV file

In the build folder is a file called "convert_icons.js" that is used to convert the file generated by msdf to something we can use in canvas.
The result of this will save a file "/src/managers/font-atlas/icons.js".