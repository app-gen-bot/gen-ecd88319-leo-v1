# themes API

**Source:** https://docs.replit.com/extensions/api/themes  
**Section:** extensions  
**Scraped:** 2025-09-08 20:26:40

---

API Referencethemes APICopy pageAccess and utilize theme data and color tokens in your Replit extensions. Get current theme values and listen for theme changes.Copy page

The themes api allows you to access the current user’s theme and utilize the color tokens accordingly.

## ​Usage

Copy

Ask AI

```
import { themes } from '@replit/extensions';

```

## ​Methods

### ​themes.getCurrentTheme

Returns all metadata on the current theme including syntax highlighting, description, HSL, token values, and more.

Copy

Ask AI

```
getCurrentTheme(): Promise<ThemeVersion>

```

### ​themes.getCurrentThemeValues

Returns the current theme’s global token values.

Copy

Ask AI

```
getCurrentThemeValues(): Promise<ThemeValuesGlobal>

```

### ​themes.onThemeChange

Fires the callback parameter function with the updated theme when the user’s theme changes.

Copy

Ask AI

```
onThemeChange(callback: OnThemeChangeListener): Promise<DisposerFunction>

```

### ​themes.onThemeChangeValues

Fires the callback parameter function with the updated theme values when the user’s theme changes.

Copy

Ask AI

```
onThemeChangeValues(callback: OnThemeChangeValuesListener): Promise<DisposerFunction>

```

## ​Types

### ​ColorScheme

Enumerated Color Scheme

PropertyType

### ​CustomTheme

Custom Theme GraphQL type

PropertyTypeauthorUsercolorSchemeColorSchemehasUnpublishedChangesbooleanidnumberisCurrentUserThemeAuthorbooleanisInstalledByCurrentUserbooleanlatestThemeVersionThemeVersionnumInstalls?numberslug?stringstatus?"private" │ "public"title?string

### ​ThemeEditorSyntaxHighlighting

Theme Editor Syntax Highlighting

PropertyType__typenamestringtagsThemeSyntaxHighlightingTag[]valuesThemeSyntaxHighlightingModifier

### ​ThemeSyntaxHighlightingModifier

Theme Syntax Highlighting Modifier

PropertyTypecolor?stringfontSize?stringfontStyle?stringfontWeight?stringtextDecoration?string

### ​ThemeSyntaxHighlightingTag

Theme Syntax Highlighting Tag

PropertyType__typenamestringmodifiersnull │ string[]namestring

### ​ThemeValues

Both global and editor theme values

PropertyType__typename?stringeditorThemeValuesEditorglobalThemeValuesGlobal

### ​ThemeValuesEditor

Editor Theme Values, an array of ThemeEditorSyntaxHighlighting

PropertyTypesyntaxHighlightingThemeEditorSyntaxHighlighting[]

### ​ThemeValuesGlobal

Global theme values interface

PropertyType__typename?stringaccentNegativeDefaultstringaccentNegativeDimmerstringaccentNegativeDimmeststringaccentNegativeStrongerstringaccentNegativeStrongeststringaccentPositiveDefaultstringaccentPositiveDimmerstringaccentPositiveDimmeststringaccentPositiveStrongerstringaccentPositiveStrongeststringaccentPrimaryDefaultstringaccentPrimaryDimmerstringaccentPrimaryDimmeststringaccentPrimaryStrongerstringaccentPrimaryStrongeststringbackgroundDefaultstringbackgroundHigherstringbackgroundHigheststringbackgroundOverlaystringbackgroundRootstringblackstringblueDefaultstringblueDimmerstringblueDimmeststringblueStrongerstringblueStrongeststringblurpleDefaultstringblurpleDimmerstringblurpleDimmeststringblurpleStrongerstringblurpleStrongeststringbrownDefaultstringbrownDimmerstringbrownDimmeststringbrownStrongerstringbrownStrongeststringforegroundDefaultstringforegroundDimmerstringforegroundDimmeststringgreenDefaultstringgreenDimmerstringgreenDimmeststringgreenStrongerstringgreenStrongeststringgreyDefaultstringgreyDimmerstringgreyDimmeststringgreyStrongerstringgreyStrongeststringlimeDefaultstringlimeDimmerstringlimeDimmeststringlimeStrongerstringlimeStrongeststringmagentaDefaultstringmagentaDimmerstringmagentaDimmeststringmagentaStrongerstringmagentaStrongeststringorangeDefaultstringorangeDimmerstringorangeDimmeststringorangeStrongerstringorangeStrongeststringoutlineDefaultstringoutlineDimmerstringoutlineDimmeststringoutlineStrongerstringoutlineStrongeststringpinkDefaultstringpinkDimmerstringpinkDimmeststringpinkStrongerstringpinkStrongeststringpurpleDefaultstringpurpleDimmerstringpurpleDimmeststringpurpleStrongerstringpurpleStrongeststringredDefaultstringredDimmerstringredDimmeststringredStrongerstringredStrongeststringtealDefaultstringtealDimmerstringtealDimmeststringtealStrongerstringtealStrongeststringwhitestringyellowDefaultstringyellowDimmerstringyellowDimmeststringyellowStrongerstringyellowStrongeststring

### ​ThemeVersion

Theme Version GraphQL type

PropertyType__typename?stringcustomTheme?CustomThemedescription?stringhuenumberidnumberlightnessnumbersaturationnumbertimeUpdated?stringvalues?ThemeValues

### ​ColorScheme

Enumerated Color Scheme

Copy

Ask AI

```
Dark = 'dark'
Light = 'light'

```

### ​DisposerFunction

A cleanup/disposer function (void)

Copy

Ask AI

```
() => void

```

### ​OnThemeChangeListener

Fires with the new theme data when the current theme changes

Copy

Ask AI

```
(theme: ThemeVersion) => void

```

Was this page helpful?

Yes

No

[Previous](https://docs.replit.com/extensions/api/session)

[OverviewLearn how to prepare and publish your Replit Extension to the store, including icon design, build configuration, and the review process.Next](https://docs.replit.com/extensions/publish)
