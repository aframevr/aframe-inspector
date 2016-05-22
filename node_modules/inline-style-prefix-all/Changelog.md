# Changelog

## 2.0
### 2.0.2
* does not prefix `msTransition` or `mozTransition` as they do not exist

### 2.0.1
* no more prefixing of already prefixed values ( [#9](https://github.com/rofrischmann/inline-style-prefix-all/pull/9) by [@ajoslin](https://github.com/ajoslin) )
* Fallback value order was reversed back to 1.0.x behavior, prefixed values first ( [#10](https://github.com/rofrischmann/inline-style-prefix-all/issues/10) )

### 2.0.0
Major update as API changes happened. <br>
1.1.0 was released by mistake and should have been a major update itself.<br>
I apologize for all broken dependencies.

## 1.1
### 1.1.0
##### API changes
* Fallback values get returned as an array instead of a static string ( [#7](https://github.com/rofrischmann/inline-style-prefix-all/pull/7) by [@rtsao](https://github.com/rtsao) )

## 1.0
### 1.0.5
* fixed a bug that added wrong prefixes to already prefixed transitions ( [#6](https://github.com/rofrischmann/inline-style-prefix-all/issues/6) )

### 1.0.3
* prevent `alignSelf` and `alignContent` from rendering alternative values
* removed some unnecessary flexbox properties from `ms` prefixes

### 1.0.2
* simplified plugins by a lot
* removed unnecessary checks and replacements
* fixed a bug that caused crashes if `display` got either `null` or `undefined` assigned ( [inline-style-prefixer#71](https://github.com/rofrischmann/inline-style-prefixer/pull/71#issue-139056802) )

### 1.0.1
* pulled a bugfix by Khan Academy that dash-cases fallback properties (https://github.com/Khan/inline-style-prefixer/commit/f41f3040ac27eeec3b7a1fb7450ddce250cac4e4)
* optimized `Webkit`-prefixed `transition` values (https://github.com/rofrischmann/inline-style-prefix-all/issues/2)

### 1.0.0
Initial version
