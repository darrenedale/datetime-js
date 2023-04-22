# DateTime JS
Improved Date and Time handling for javascript

Three primary classes are provided:

- `DateTime` provides an immutable representation of a date and time, accurate to the millisecond. It is timezone-aware, and can represent a point in time in any timezone.

- `TimeZone` represents a timezone for a DateTime object. It represents an offset, accurate to the minute, from UTC.

- `DateTimeFormatter` provides extensible fomratting of `DateTime` instances to strings.

## Releases

This library is in the very early stages of development and should be considered experimental. Releases are built for all combinations of the following ECMAScript standards and module systems:

### ECMAScript
- ES2015
- ES2016
- ES2017
- ES2018
- ES2019
- ES2020
- ES2021
- ES2022

### Modules
- commonjs
- ES2015
- ES2022
- ES2022

Packages are named as

    datetime-js-{es-version}-{module-system}.tar.gz
