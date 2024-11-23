# Variable font instance export

## The Problem

Support for variable fonts in email clients is uncertain. Therefore, when working with a variable font, it's best to export a static instance of the desired variant for use in emails. This document explains how to accomplish this.

Normally, to use the Semi Bold Exp One variant of the Protrakt font in CSS, we need to know the axes and coordinates of that variant, as there is no way to select it by its name. Example:

```css
@font-face {
    font-family: "Protrakt";
    src: url('/fonts/protrakt.eot'); /* IE9 Compat Modes */
    src: url('/fonts/protrakt.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url('/fonts/protrakt.woff2') format('woff2'), /* Super Modern Browsers */
        url('/fonts/protrakt.woff') format('woff'), /* Pretty Modern Browsers */
        url('/fonts/protrakt.ttf')  format('truetype'), /* Safari, Android, iOS */
        url('/fonts/protrakt.svg#svgFontName') format('svg'); /* Legacy iOS */
}

.font-test {
    font-family: Protrakt, Helvetica, Arial, sans-serif;
    /* Selecting variant (legacy way) */
    font-weight: 600;
    font-stretch: 1%;
    /* or using modern way */
    font-variation-settings: "wght" 600, "wdth" 1;
}
```

You may use [FontDrop](https://fontdrop.info/) to inspect font file and discover axes and coordinates for predefined instances like *Protrakt Semi Bold Exp One* (look for `fvar` table):

Axes:

```json
{"tag":"wght","minValue":300,"defaultValue":300,"maxValue":900,"name":{"en":"Weight"}}
{"tag":"wdth","minValue":0,"defaultValue":0,"maxValue":9,"name":{"en":"Width"}}
```

Instances:

```json
{"name":{"en":"Light"},"coordinates":{"wght":300,"wdth":0}}
{"name":{"en":"Light-Exp-One"},"coordinates":{"wght":300,"wdth":1}}
{"name":{"en":"Light-Exp-Two"},"coordinates":{"wght":300,"wdth":2}}
{"name":{"en":"Light-Exp-Three"},"coordinates":{"wght":300,"wdth":3}}
{"name":{"en":"Light-Exp-Four"},"coordinates":{"wght":300,"wdth":4}}
{"name":{"en":"Light Exp-Five"},"coordinates":{"wght":300,"wdth":5}}
{"name":{"en":"Light-Exp-Six"},"coordinates":{"wght":300,"wdth":6}}
{"name":{"en":"Light-Exp-Seven"},"coordinates":{"wght":300,"wdth":7}}
{"name":{"en":"Light-Exp-Eight"},"coordinates":{"wght":300,"wdth":8}}
{"name":{"en":"Light-Exp-Nine"},"coordinates":{"wght":300,"wdth":9}}
{"name":{"en":"Regular"},"coordinates":{"wght":400,"wdth":0}}
{"name":{"en":"Regular-Exp-one"},"coordinates":{"wght":400,"wdth":1}}
{"name":{"en":"Regular-Exp-Two"},"coordinates":{"wght":400,"wdth":2}}
{"name":{"en":"Regular-Exp-Three"},"coordinates":{"wght":400,"wdth":3}}
{"name":{"en":"Regular Exp-Four"},"coordinates":{"wght":400,"wdth":4}}
{"name":{"en":"Regular-Exp-Five"},"coordinates":{"wght":400,"wdth":5}}
{"name":{"en":"Regular-Exp-Six"},"coordinates":{"wght":400,"wdth":6}}
{"name":{"en":"Regular-Exp-Seven"},"coordinates":{"wght":400,"wdth":7}}
{"name":{"en":"Regular-Exp-Eight"},"coordinates":{"wght":400,"wdth":8}}
{"name":{"en":"Regular-Exp-Nine"},"coordinates":{"wght":400,"wdth":9}}
{"name":{"en":"Medium"},"coordinates":{"wght":500,"wdth":0}}
{"name":{"en":"Medium-Exp-One"},"coordinates":{"wght":500,"wdth":1}}
{"name":{"en":"Medium-Exp-Two"},"coordinates":{"wght":500,"wdth":2}}
{"name":{"en":"Medium-Exp-Three"},"coordinates":{"wght":500,"wdth":3}}
{"name":{"en":"Medium-Exp-Four"},"coordinates":{"wght":500,"wdth":4}}
{"name":{"en":"Medium-Exp-Five"},"coordinates":{"wght":500,"wdth":5}}
{"name":{"en":"Medium-Exp-Six"},"coordinates":{"wght":500,"wdth":6}}
{"name":{"en":"Medium-Exp-Seven"},"coordinates":{"wght":500,"wdth":7}}
{"name":{"en":"Medium-Exp-Eight"},"coordinates":{"wght":500,"wdth":8}}
{"name":{"en":"Medium-Exp-Nine"},"coordinates":{"wght":500,"wdth":9}}
{"name":{"en":"Semi-Bold"},"coordinates":{"wght":600,"wdth":0}}
{"name":{"en":"Semi-Bold-Exp-One"},"coordinates":{"wght":600,"wdth":1}}
{"name":{"en":"Semi-Bold-Exp-Two"},"coordinates":{"wght":600,"wdth":2}}
{"name":{"en":"Semi-Bold-Exp-Three"},"coordinates":{"wght":600,"wdth":3}}
{"name":{"en":"Semi-Bold-Exp-Four"},"coordinates":{"wght":600,"wdth":4}}
{"name":{"en":"Semi-Bold-Exp-Five"},"coordinates":{"wght":600,"wdth":5}}
{"name":{"en":"Semi-Bold-Exp-Six"},"coordinates":{"wght":600,"wdth":6}}
{"name":{"en":"Semi-Bold-Exp-Seven"},"coordinates":{"wght":600,"wdth":7}}
{"name":{"en":"Semi-Bold-Exp-Eight"},"coordinates":{"wght":600,"wdth":8}}
{"name":{"en":"Semi-Bold-Exp-Nine"},"coordinates":{"wght":600,"wdth":9}}
{"name":{"en":"Bold"},"coordinates":{"wght":700,"wdth":0}}
{"name":{"en":"Bold-Exp-One"},"coordinates":{"wght":700,"wdth":1}}
{"name":{"en":"Bold-Exp-Two"},"coordinates":{"wght":700,"wdth":2}}
{"name":{"en":"Bold Exp-Three"},"coordinates":{"wght":700,"wdth":3}}
{"name":{"en":"Bold-Exp-Four"},"coordinates":{"wght":700,"wdth":4}}
{"name":{"en":"Bold-Exp-Five"},"coordinates":{"wght":700,"wdth":5}}
{"name":{"en":"Bold Exp-Six"},"coordinates":{"wght":700,"wdth":6}}
{"name":{"en":"Bold-Exp-Seven"},"coordinates":{"wght":700,"wdth":7}}
{"name":{"en":"Bold-Expanded-Eight"},"coordinates":{"wght":700,"wdth":8}}
{"name":{"en":"Bold-Exp-Nine"},"coordinates":{"wght":700,"wdth":9}}
{"name":{"en":"Extra Bold"},"coordinates":{"wght":800,"wdth":0}}
{"name":{"en":"Extra-Bold-Exp-One"},"coordinates":{"wght":800,"wdth":1}}
{"name":{"en":"Extra-Bold-Exp-Two"},"coordinates":{"wght":800,"wdth":2}}
{"name":{"en":"Extra-Bold-Exp-Three"},"coordinates":{"wght":800,"wdth":3}}
{"name":{"en":"Extra-Bold-Exp-Four"},"coordinates":{"wght":800,"wdth":4}}
{"name":{"en":"Extra-Bold-Exp-Five"},"coordinates":{"wght":800,"wdth":5}}
{"name":{"en":"Extra-Bold-Exp-Six"},"coordinates":{"wght":800,"wdth":6}}
{"name":{"en":"Extra-Bold-Exp-Seven"},"coordinates":{"wght":800,"wdth":7}}
{"name":{"en":"Extra-Bold-Exp-Eight"},"coordinates":{"wght":800,"wdth":8}}
{"name":{"en":"Extra-Bold-Exp-Nine"},"coordinates":{"wght":800,"wdth":9}}
{"name":{"en":"Heavy"},"coordinates":{"wght":900,"wdth":0}}
{"name":{"en":"Heavy-Exp-One"},"coordinates":{"wght":900,"wdth":1}}
{"name":{"en":"Heavy-Exp-Two"},"coordinates":{"wght":900,"wdth":2}}
{"name":{"en":"Heavy-Exp-Three"},"coordinates":{"wght":900,"wdth":3}}
{"name":{"en":"Heavy-Exp-Four"},"coordinates":{"wght":900,"wdth":4}}
{"name":{"en":"Heavy-Exp-Five"},"coordinates":{"wght":900,"wdth":5}}
{"name":{"en":"Heavy-Exp-Six"},"coordinates":{"wght":900,"wdth":6}}
{"name":{"en":"Heavy-Exp-Seven"},"coordinates":{"wght":900,"wdth":7}}
{"name":{"en":"Heavy-Exp-Eight"},"coordinates":{"wght":900,"wdth":8}}
{"name":{"en":"Heavy-Exp-Nine"},"coordinates":{"wght":900,"wdth":9}}
```

## Solution

To export only one instance (e.g., **Semi-Bold-Exp-One**) from a `.woff2` variable font file, you can use a font editing tool to extract it. Here are the steps:

---

### **1. Using FontForge (Free, Open-Source)**

#### **Step 1: Open the Font File**
1. Download and install [FontForge](https://fontforge.org/).
2. Open your `.woff2` file in FontForge.

#### **Step 2: Set the Instance**
1. Go to **File > Font Info** to check the `fvar` table for available instances.
2. If you see `Semi-Bold-Exp-One` as an instance, go to **Element > Font Variations**.
3. Adjust the sliders for `wght` and `wdth` axes:  
   - Set `wght` = 600  
   - Set `wdth` = 1  

#### **Step 3: Apply the Settings**
1. Click **OK** to apply the changes.
2. Verify in the font view that the instance settings are applied.

#### **Step 4: Export the Instance**
1. Go to **File > Generate Fonts**.
2. Select `.woff2` as the output format (or another if needed).
3. Save the file with a name like `Protrakt-SemiBoldExpOne.woff2`.

---

### **2. Using Glyphs (Paid, More Intuitive)**

#### **Step 1: Open the Font**
1. Open the `.woff2` file in Glyphs.
2. Navigate to the **Instances** section on the left panel.

#### **Step 2: Select the Instance**
1. Find the `Semi-Bold-Exp-One` instance in the list.
2. Right-click on it and choose **Export Instance**.

#### **Step 3: Export**
1. Select the `.woff2` format.
2. Click **Export** to save the font as a new `.woff2` file.

---

### **3. Using CLI Tools**

If you prefer command-line tools, use [fonttools](https://github.com/fonttools/fonttools), a popular toolkit for font manipulation.

#### **Step 1: Install FontTools**
Install fonttools using pip:
```bash
pip install fonttools
```

#### **Step 2: Extract the Instance**
Use the `varLib.instancer` command to export the specific instance:
```bash
fonttools varLib.instancer Protrakt.woff2 wght=600 wdth=1 -o Protrakt-SemiBoldExpOne.woff2
```
This will create a new `.woff2` file containing only the **Semi-Bold-Exp-One** instance.

---

### **4. Verify the Export**
After exporting the instance:
1. Open the new font file in FontForge or test it in a browser.
2. Ensure it includes only the desired style (`wght` = 600, `wdth` = 1).

---

### **Conclusion**
The easiest tools to export a single instance are **FontForge** (free) or **fonttools** (quick and CLI-based). Once exported, you can use the new static instance in your `@font-face` declarations to enhance compatibility with email clients.