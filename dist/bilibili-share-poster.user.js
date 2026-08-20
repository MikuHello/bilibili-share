// ==UserScript==
// @name         Bilibili 分享海报
// @namespace    https://github.com/mikuhello/bilibili-share
// @version      0.1.0
// @description  在 Bilibili 标准视频页生成 A/B 主题分享海报、复制分享文案与组合剪贴板内容
// @match        https://www.bilibili.com/video/BV*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        window.onurlchange
// @connect      api.bilibili.com
// @connect      b23.tv
// @connect      *.hdslb.com
// @run-at       document-idle
// ==/UserScript==
"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/qrcode/lib/can-promise.js
  var require_can_promise = __commonJS({
    "node_modules/qrcode/lib/can-promise.js"(exports, module) {
      module.exports = function() {
        return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
      };
    }
  });

  // node_modules/qrcode/lib/core/utils.js
  var require_utils = __commonJS({
    "node_modules/qrcode/lib/core/utils.js"(exports) {
      var toSJISFunction;
      var CODEWORDS_COUNT = [
        0,
        // Not used
        26,
        44,
        70,
        100,
        134,
        172,
        196,
        242,
        292,
        346,
        404,
        466,
        532,
        581,
        655,
        733,
        815,
        901,
        991,
        1085,
        1156,
        1258,
        1364,
        1474,
        1588,
        1706,
        1828,
        1921,
        2051,
        2185,
        2323,
        2465,
        2611,
        2761,
        2876,
        3034,
        3196,
        3362,
        3532,
        3706
      ];
      exports.getSymbolSize = function getSymbolSize(version) {
        if (!version) throw new Error('"version" cannot be null or undefined');
        if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
        return version * 4 + 17;
      };
      exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
        return CODEWORDS_COUNT[version];
      };
      exports.getBCHDigit = function(data) {
        let digit = 0;
        while (data !== 0) {
          digit++;
          data >>>= 1;
        }
        return digit;
      };
      exports.setToSJISFunction = function setToSJISFunction(f) {
        if (typeof f !== "function") {
          throw new Error('"toSJISFunc" is not a valid function.');
        }
        toSJISFunction = f;
      };
      exports.isKanjiModeEnabled = function() {
        return typeof toSJISFunction !== "undefined";
      };
      exports.toSJIS = function toSJIS(kanji) {
        return toSJISFunction(kanji);
      };
    }
  });

  // node_modules/qrcode/lib/core/error-correction-level.js
  var require_error_correction_level = __commonJS({
    "node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
      exports.L = { bit: 1 };
      exports.M = { bit: 0 };
      exports.Q = { bit: 3 };
      exports.H = { bit: 2 };
      function fromString(string) {
        if (typeof string !== "string") {
          throw new Error("Param is not a string");
        }
        const lcStr = string.toLowerCase();
        switch (lcStr) {
          case "l":
          case "low":
            return exports.L;
          case "m":
          case "medium":
            return exports.M;
          case "q":
          case "quartile":
            return exports.Q;
          case "h":
          case "high":
            return exports.H;
          default:
            throw new Error("Unknown EC Level: " + string);
        }
      }
      exports.isValid = function isValid(level) {
        return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
      };
      exports.from = function from(value, defaultValue) {
        if (exports.isValid(value)) {
          return value;
        }
        try {
          return fromString(value);
        } catch (e) {
          return defaultValue;
        }
      };
    }
  });

  // node_modules/qrcode/lib/core/bit-buffer.js
  var require_bit_buffer = __commonJS({
    "node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
      function BitBuffer() {
        this.buffer = [];
        this.length = 0;
      }
      BitBuffer.prototype = {
        get: function(index) {
          const bufIndex = Math.floor(index / 8);
          return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
        },
        put: function(num, length) {
          for (let i = 0; i < length; i++) {
            this.putBit((num >>> length - i - 1 & 1) === 1);
          }
        },
        getLengthInBits: function() {
          return this.length;
        },
        putBit: function(bit) {
          const bufIndex = Math.floor(this.length / 8);
          if (this.buffer.length <= bufIndex) {
            this.buffer.push(0);
          }
          if (bit) {
            this.buffer[bufIndex] |= 128 >>> this.length % 8;
          }
          this.length++;
        }
      };
      module.exports = BitBuffer;
    }
  });

  // node_modules/qrcode/lib/core/bit-matrix.js
  var require_bit_matrix = __commonJS({
    "node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
      function BitMatrix(size) {
        if (!size || size < 1) {
          throw new Error("BitMatrix size must be defined and greater than 0");
        }
        this.size = size;
        this.data = new Uint8Array(size * size);
        this.reservedBit = new Uint8Array(size * size);
      }
      BitMatrix.prototype.set = function(row, col, value, reserved) {
        const index = row * this.size + col;
        this.data[index] = value;
        if (reserved) this.reservedBit[index] = true;
      };
      BitMatrix.prototype.get = function(row, col) {
        return this.data[row * this.size + col];
      };
      BitMatrix.prototype.xor = function(row, col, value) {
        this.data[row * this.size + col] ^= value;
      };
      BitMatrix.prototype.isReserved = function(row, col) {
        return this.reservedBit[row * this.size + col];
      };
      module.exports = BitMatrix;
    }
  });

  // node_modules/qrcode/lib/core/alignment-pattern.js
  var require_alignment_pattern = __commonJS({
    "node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
      var getSymbolSize = require_utils().getSymbolSize;
      exports.getRowColCoords = function getRowColCoords(version) {
        if (version === 1) return [];
        const posCount = Math.floor(version / 7) + 2;
        const size = getSymbolSize(version);
        const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
        const positions = [size - 7];
        for (let i = 1; i < posCount - 1; i++) {
          positions[i] = positions[i - 1] - intervals;
        }
        positions.push(6);
        return positions.reverse();
      };
      exports.getPositions = function getPositions(version) {
        const coords = [];
        const pos = exports.getRowColCoords(version);
        const posLength = pos.length;
        for (let i = 0; i < posLength; i++) {
          for (let j = 0; j < posLength; j++) {
            if (i === 0 && j === 0 || // top-left
            i === 0 && j === posLength - 1 || // bottom-left
            i === posLength - 1 && j === 0) {
              continue;
            }
            coords.push([pos[i], pos[j]]);
          }
        }
        return coords;
      };
    }
  });

  // node_modules/qrcode/lib/core/finder-pattern.js
  var require_finder_pattern = __commonJS({
    "node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
      var getSymbolSize = require_utils().getSymbolSize;
      var FINDER_PATTERN_SIZE = 7;
      exports.getPositions = function getPositions(version) {
        const size = getSymbolSize(version);
        return [
          // top-left
          [0, 0],
          // top-right
          [size - FINDER_PATTERN_SIZE, 0],
          // bottom-left
          [0, size - FINDER_PATTERN_SIZE]
        ];
      };
    }
  });

  // node_modules/qrcode/lib/core/mask-pattern.js
  var require_mask_pattern = __commonJS({
    "node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
      exports.Patterns = {
        PATTERN000: 0,
        PATTERN001: 1,
        PATTERN010: 2,
        PATTERN011: 3,
        PATTERN100: 4,
        PATTERN101: 5,
        PATTERN110: 6,
        PATTERN111: 7
      };
      var PenaltyScores = {
        N1: 3,
        N2: 3,
        N3: 40,
        N4: 10
      };
      exports.isValid = function isValid(mask) {
        return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
      };
      exports.from = function from(value) {
        return exports.isValid(value) ? parseInt(value, 10) : void 0;
      };
      exports.getPenaltyN1 = function getPenaltyN1(data) {
        const size = data.size;
        let points = 0;
        let sameCountCol = 0;
        let sameCountRow = 0;
        let lastCol = null;
        let lastRow = null;
        for (let row = 0; row < size; row++) {
          sameCountCol = sameCountRow = 0;
          lastCol = lastRow = null;
          for (let col = 0; col < size; col++) {
            let module2 = data.get(row, col);
            if (module2 === lastCol) {
              sameCountCol++;
            } else {
              if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
              lastCol = module2;
              sameCountCol = 1;
            }
            module2 = data.get(col, row);
            if (module2 === lastRow) {
              sameCountRow++;
            } else {
              if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
              lastRow = module2;
              sameCountRow = 1;
            }
          }
          if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
          if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
        }
        return points;
      };
      exports.getPenaltyN2 = function getPenaltyN2(data) {
        const size = data.size;
        let points = 0;
        for (let row = 0; row < size - 1; row++) {
          for (let col = 0; col < size - 1; col++) {
            const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
            if (last === 4 || last === 0) points++;
          }
        }
        return points * PenaltyScores.N2;
      };
      exports.getPenaltyN3 = function getPenaltyN3(data) {
        const size = data.size;
        let points = 0;
        let bitsCol = 0;
        let bitsRow = 0;
        for (let row = 0; row < size; row++) {
          bitsCol = bitsRow = 0;
          for (let col = 0; col < size; col++) {
            bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
            if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
            bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
            if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
          }
        }
        return points * PenaltyScores.N3;
      };
      exports.getPenaltyN4 = function getPenaltyN4(data) {
        let darkCount = 0;
        const modulesCount = data.data.length;
        for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
        const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
        return k * PenaltyScores.N4;
      };
      function getMaskAt(maskPattern, i, j) {
        switch (maskPattern) {
          case exports.Patterns.PATTERN000:
            return (i + j) % 2 === 0;
          case exports.Patterns.PATTERN001:
            return i % 2 === 0;
          case exports.Patterns.PATTERN010:
            return j % 3 === 0;
          case exports.Patterns.PATTERN011:
            return (i + j) % 3 === 0;
          case exports.Patterns.PATTERN100:
            return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
          case exports.Patterns.PATTERN101:
            return i * j % 2 + i * j % 3 === 0;
          case exports.Patterns.PATTERN110:
            return (i * j % 2 + i * j % 3) % 2 === 0;
          case exports.Patterns.PATTERN111:
            return (i * j % 3 + (i + j) % 2) % 2 === 0;
          default:
            throw new Error("bad maskPattern:" + maskPattern);
        }
      }
      exports.applyMask = function applyMask(pattern, data) {
        const size = data.size;
        for (let col = 0; col < size; col++) {
          for (let row = 0; row < size; row++) {
            if (data.isReserved(row, col)) continue;
            data.xor(row, col, getMaskAt(pattern, row, col));
          }
        }
      };
      exports.getBestMask = function getBestMask(data, setupFormatFunc) {
        const numPatterns = Object.keys(exports.Patterns).length;
        let bestPattern = 0;
        let lowerPenalty = Infinity;
        for (let p = 0; p < numPatterns; p++) {
          setupFormatFunc(p);
          exports.applyMask(p, data);
          const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
          exports.applyMask(p, data);
          if (penalty < lowerPenalty) {
            lowerPenalty = penalty;
            bestPattern = p;
          }
        }
        return bestPattern;
      };
    }
  });

  // node_modules/qrcode/lib/core/error-correction-code.js
  var require_error_correction_code = __commonJS({
    "node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
      var ECLevel = require_error_correction_level();
      var EC_BLOCKS_TABLE = [
        // L  M  Q  H
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        1,
        2,
        2,
        1,
        2,
        2,
        4,
        1,
        2,
        4,
        4,
        2,
        4,
        4,
        4,
        2,
        4,
        6,
        5,
        2,
        4,
        6,
        6,
        2,
        5,
        8,
        8,
        4,
        5,
        8,
        8,
        4,
        5,
        8,
        11,
        4,
        8,
        10,
        11,
        4,
        9,
        12,
        16,
        4,
        9,
        16,
        16,
        6,
        10,
        12,
        18,
        6,
        10,
        17,
        16,
        6,
        11,
        16,
        19,
        6,
        13,
        18,
        21,
        7,
        14,
        21,
        25,
        8,
        16,
        20,
        25,
        8,
        17,
        23,
        25,
        9,
        17,
        23,
        34,
        9,
        18,
        25,
        30,
        10,
        20,
        27,
        32,
        12,
        21,
        29,
        35,
        12,
        23,
        34,
        37,
        12,
        25,
        34,
        40,
        13,
        26,
        35,
        42,
        14,
        28,
        38,
        45,
        15,
        29,
        40,
        48,
        16,
        31,
        43,
        51,
        17,
        33,
        45,
        54,
        18,
        35,
        48,
        57,
        19,
        37,
        51,
        60,
        19,
        38,
        53,
        63,
        20,
        40,
        56,
        66,
        21,
        43,
        59,
        70,
        22,
        45,
        62,
        74,
        24,
        47,
        65,
        77,
        25,
        49,
        68,
        81
      ];
      var EC_CODEWORDS_TABLE = [
        // L  M  Q  H
        7,
        10,
        13,
        17,
        10,
        16,
        22,
        28,
        15,
        26,
        36,
        44,
        20,
        36,
        52,
        64,
        26,
        48,
        72,
        88,
        36,
        64,
        96,
        112,
        40,
        72,
        108,
        130,
        48,
        88,
        132,
        156,
        60,
        110,
        160,
        192,
        72,
        130,
        192,
        224,
        80,
        150,
        224,
        264,
        96,
        176,
        260,
        308,
        104,
        198,
        288,
        352,
        120,
        216,
        320,
        384,
        132,
        240,
        360,
        432,
        144,
        280,
        408,
        480,
        168,
        308,
        448,
        532,
        180,
        338,
        504,
        588,
        196,
        364,
        546,
        650,
        224,
        416,
        600,
        700,
        224,
        442,
        644,
        750,
        252,
        476,
        690,
        816,
        270,
        504,
        750,
        900,
        300,
        560,
        810,
        960,
        312,
        588,
        870,
        1050,
        336,
        644,
        952,
        1110,
        360,
        700,
        1020,
        1200,
        390,
        728,
        1050,
        1260,
        420,
        784,
        1140,
        1350,
        450,
        812,
        1200,
        1440,
        480,
        868,
        1290,
        1530,
        510,
        924,
        1350,
        1620,
        540,
        980,
        1440,
        1710,
        570,
        1036,
        1530,
        1800,
        570,
        1064,
        1590,
        1890,
        600,
        1120,
        1680,
        1980,
        630,
        1204,
        1770,
        2100,
        660,
        1260,
        1860,
        2220,
        720,
        1316,
        1950,
        2310,
        750,
        1372,
        2040,
        2430
      ];
      exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
        switch (errorCorrectionLevel) {
          case ECLevel.L:
            return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
          case ECLevel.M:
            return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
          case ECLevel.Q:
            return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
          case ECLevel.H:
            return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
          default:
            return void 0;
        }
      };
      exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
        switch (errorCorrectionLevel) {
          case ECLevel.L:
            return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
          case ECLevel.M:
            return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
          case ECLevel.Q:
            return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
          case ECLevel.H:
            return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
          default:
            return void 0;
        }
      };
    }
  });

  // node_modules/qrcode/lib/core/galois-field.js
  var require_galois_field = __commonJS({
    "node_modules/qrcode/lib/core/galois-field.js"(exports) {
      var EXP_TABLE = new Uint8Array(512);
      var LOG_TABLE = new Uint8Array(256);
      (function initTables() {
        let x = 1;
        for (let i = 0; i < 255; i++) {
          EXP_TABLE[i] = x;
          LOG_TABLE[x] = i;
          x <<= 1;
          if (x & 256) {
            x ^= 285;
          }
        }
        for (let i = 255; i < 512; i++) {
          EXP_TABLE[i] = EXP_TABLE[i - 255];
        }
      })();
      exports.log = function log(n) {
        if (n < 1) throw new Error("log(" + n + ")");
        return LOG_TABLE[n];
      };
      exports.exp = function exp(n) {
        return EXP_TABLE[n];
      };
      exports.mul = function mul(x, y) {
        if (x === 0 || y === 0) return 0;
        return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
      };
    }
  });

  // node_modules/qrcode/lib/core/polynomial.js
  var require_polynomial = __commonJS({
    "node_modules/qrcode/lib/core/polynomial.js"(exports) {
      var GF = require_galois_field();
      exports.mul = function mul(p1, p2) {
        const coeff = new Uint8Array(p1.length + p2.length - 1);
        for (let i = 0; i < p1.length; i++) {
          for (let j = 0; j < p2.length; j++) {
            coeff[i + j] ^= GF.mul(p1[i], p2[j]);
          }
        }
        return coeff;
      };
      exports.mod = function mod(divident, divisor) {
        let result = new Uint8Array(divident);
        while (result.length - divisor.length >= 0) {
          const coeff = result[0];
          for (let i = 0; i < divisor.length; i++) {
            result[i] ^= GF.mul(divisor[i], coeff);
          }
          let offset = 0;
          while (offset < result.length && result[offset] === 0) offset++;
          result = result.slice(offset);
        }
        return result;
      };
      exports.generateECPolynomial = function generateECPolynomial(degree) {
        let poly = new Uint8Array([1]);
        for (let i = 0; i < degree; i++) {
          poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
        }
        return poly;
      };
    }
  });

  // node_modules/qrcode/lib/core/reed-solomon-encoder.js
  var require_reed_solomon_encoder = __commonJS({
    "node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
      var Polynomial = require_polynomial();
      function ReedSolomonEncoder(degree) {
        this.genPoly = void 0;
        this.degree = degree;
        if (this.degree) this.initialize(this.degree);
      }
      ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
        this.degree = degree;
        this.genPoly = Polynomial.generateECPolynomial(this.degree);
      };
      ReedSolomonEncoder.prototype.encode = function encode(data) {
        if (!this.genPoly) {
          throw new Error("Encoder not initialized");
        }
        const paddedData = new Uint8Array(data.length + this.degree);
        paddedData.set(data);
        const remainder = Polynomial.mod(paddedData, this.genPoly);
        const start = this.degree - remainder.length;
        if (start > 0) {
          const buff = new Uint8Array(this.degree);
          buff.set(remainder, start);
          return buff;
        }
        return remainder;
      };
      module.exports = ReedSolomonEncoder;
    }
  });

  // node_modules/qrcode/lib/core/version-check.js
  var require_version_check = __commonJS({
    "node_modules/qrcode/lib/core/version-check.js"(exports) {
      exports.isValid = function isValid(version) {
        return !isNaN(version) && version >= 1 && version <= 40;
      };
    }
  });

  // node_modules/qrcode/lib/core/regex.js
  var require_regex = __commonJS({
    "node_modules/qrcode/lib/core/regex.js"(exports) {
      var numeric = "[0-9]+";
      var alphanumeric = "[A-Z $%*+\\-./:]+";
      var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
      kanji = kanji.replace(/u/g, "\\u");
      var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
      exports.KANJI = new RegExp(kanji, "g");
      exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
      exports.BYTE = new RegExp(byte, "g");
      exports.NUMERIC = new RegExp(numeric, "g");
      exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
      var TEST_KANJI = new RegExp("^" + kanji + "$");
      var TEST_NUMERIC = new RegExp("^" + numeric + "$");
      var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
      exports.testKanji = function testKanji(str) {
        return TEST_KANJI.test(str);
      };
      exports.testNumeric = function testNumeric(str) {
        return TEST_NUMERIC.test(str);
      };
      exports.testAlphanumeric = function testAlphanumeric(str) {
        return TEST_ALPHANUMERIC.test(str);
      };
    }
  });

  // node_modules/qrcode/lib/core/mode.js
  var require_mode = __commonJS({
    "node_modules/qrcode/lib/core/mode.js"(exports) {
      var VersionCheck = require_version_check();
      var Regex = require_regex();
      exports.NUMERIC = {
        id: "Numeric",
        bit: 1 << 0,
        ccBits: [10, 12, 14]
      };
      exports.ALPHANUMERIC = {
        id: "Alphanumeric",
        bit: 1 << 1,
        ccBits: [9, 11, 13]
      };
      exports.BYTE = {
        id: "Byte",
        bit: 1 << 2,
        ccBits: [8, 16, 16]
      };
      exports.KANJI = {
        id: "Kanji",
        bit: 1 << 3,
        ccBits: [8, 10, 12]
      };
      exports.MIXED = {
        bit: -1
      };
      exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
        if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
        if (!VersionCheck.isValid(version)) {
          throw new Error("Invalid version: " + version);
        }
        if (version >= 1 && version < 10) return mode.ccBits[0];
        else if (version < 27) return mode.ccBits[1];
        return mode.ccBits[2];
      };
      exports.getBestModeForData = function getBestModeForData(dataStr) {
        if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
        else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
        else if (Regex.testKanji(dataStr)) return exports.KANJI;
        else return exports.BYTE;
      };
      exports.toString = function toString(mode) {
        if (mode && mode.id) return mode.id;
        throw new Error("Invalid mode");
      };
      exports.isValid = function isValid(mode) {
        return mode && mode.bit && mode.ccBits;
      };
      function fromString(string) {
        if (typeof string !== "string") {
          throw new Error("Param is not a string");
        }
        const lcStr = string.toLowerCase();
        switch (lcStr) {
          case "numeric":
            return exports.NUMERIC;
          case "alphanumeric":
            return exports.ALPHANUMERIC;
          case "kanji":
            return exports.KANJI;
          case "byte":
            return exports.BYTE;
          default:
            throw new Error("Unknown mode: " + string);
        }
      }
      exports.from = function from(value, defaultValue) {
        if (exports.isValid(value)) {
          return value;
        }
        try {
          return fromString(value);
        } catch (e) {
          return defaultValue;
        }
      };
    }
  });

  // node_modules/qrcode/lib/core/version.js
  var require_version = __commonJS({
    "node_modules/qrcode/lib/core/version.js"(exports) {
      var Utils = require_utils();
      var ECCode = require_error_correction_code();
      var ECLevel = require_error_correction_level();
      var Mode = require_mode();
      var VersionCheck = require_version_check();
      var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
      var G18_BCH = Utils.getBCHDigit(G18);
      function getBestVersionForDataLength(mode, length, errorCorrectionLevel) {
        for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
          if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
            return currentVersion;
          }
        }
        return void 0;
      }
      function getReservedBitsCount(mode, version) {
        return Mode.getCharCountIndicator(mode, version) + 4;
      }
      function getTotalBitsFromDataArray(segments, version) {
        let totalBits = 0;
        segments.forEach(function(data) {
          const reservedBits = getReservedBitsCount(data.mode, version);
          totalBits += reservedBits + data.getBitsLength();
        });
        return totalBits;
      }
      function getBestVersionForMixedData(segments, errorCorrectionLevel) {
        for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
          const length = getTotalBitsFromDataArray(segments, currentVersion);
          if (length <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
            return currentVersion;
          }
        }
        return void 0;
      }
      exports.from = function from(value, defaultValue) {
        if (VersionCheck.isValid(value)) {
          return parseInt(value, 10);
        }
        return defaultValue;
      };
      exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
        if (!VersionCheck.isValid(version)) {
          throw new Error("Invalid QR Code version");
        }
        if (typeof mode === "undefined") mode = Mode.BYTE;
        const totalCodewords = Utils.getSymbolTotalCodewords(version);
        const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
        const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
        if (mode === Mode.MIXED) return dataTotalCodewordsBits;
        const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
        switch (mode) {
          case Mode.NUMERIC:
            return Math.floor(usableBits / 10 * 3);
          case Mode.ALPHANUMERIC:
            return Math.floor(usableBits / 11 * 2);
          case Mode.KANJI:
            return Math.floor(usableBits / 13);
          case Mode.BYTE:
          default:
            return Math.floor(usableBits / 8);
        }
      };
      exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
        let seg;
        const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
        if (Array.isArray(data)) {
          if (data.length > 1) {
            return getBestVersionForMixedData(data, ecl);
          }
          if (data.length === 0) {
            return 1;
          }
          seg = data[0];
        } else {
          seg = data;
        }
        return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
      };
      exports.getEncodedBits = function getEncodedBits(version) {
        if (!VersionCheck.isValid(version) || version < 7) {
          throw new Error("Invalid QR Code version");
        }
        let d = version << 12;
        while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
          d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
        }
        return version << 12 | d;
      };
    }
  });

  // node_modules/qrcode/lib/core/format-info.js
  var require_format_info = __commonJS({
    "node_modules/qrcode/lib/core/format-info.js"(exports) {
      var Utils = require_utils();
      var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
      var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
      var G15_BCH = Utils.getBCHDigit(G15);
      exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
        const data = errorCorrectionLevel.bit << 3 | mask;
        let d = data << 10;
        while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
          d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
        }
        return (data << 10 | d) ^ G15_MASK;
      };
    }
  });

  // node_modules/qrcode/lib/core/numeric-data.js
  var require_numeric_data = __commonJS({
    "node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
      var Mode = require_mode();
      function NumericData(data) {
        this.mode = Mode.NUMERIC;
        this.data = data.toString();
      }
      NumericData.getBitsLength = function getBitsLength(length) {
        return 10 * Math.floor(length / 3) + (length % 3 ? length % 3 * 3 + 1 : 0);
      };
      NumericData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      NumericData.prototype.getBitsLength = function getBitsLength() {
        return NumericData.getBitsLength(this.data.length);
      };
      NumericData.prototype.write = function write(bitBuffer) {
        let i, group, value;
        for (i = 0; i + 3 <= this.data.length; i += 3) {
          group = this.data.substr(i, 3);
          value = parseInt(group, 10);
          bitBuffer.put(value, 10);
        }
        const remainingNum = this.data.length - i;
        if (remainingNum > 0) {
          group = this.data.substr(i);
          value = parseInt(group, 10);
          bitBuffer.put(value, remainingNum * 3 + 1);
        }
      };
      module.exports = NumericData;
    }
  });

  // node_modules/qrcode/lib/core/alphanumeric-data.js
  var require_alphanumeric_data = __commonJS({
    "node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
      var Mode = require_mode();
      var ALPHA_NUM_CHARS = [
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        " ",
        "$",
        "%",
        "*",
        "+",
        "-",
        ".",
        "/",
        ":"
      ];
      function AlphanumericData(data) {
        this.mode = Mode.ALPHANUMERIC;
        this.data = data;
      }
      AlphanumericData.getBitsLength = function getBitsLength(length) {
        return 11 * Math.floor(length / 2) + 6 * (length % 2);
      };
      AlphanumericData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      AlphanumericData.prototype.getBitsLength = function getBitsLength() {
        return AlphanumericData.getBitsLength(this.data.length);
      };
      AlphanumericData.prototype.write = function write(bitBuffer) {
        let i;
        for (i = 0; i + 2 <= this.data.length; i += 2) {
          let value = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
          value += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
          bitBuffer.put(value, 11);
        }
        if (this.data.length % 2) {
          bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
        }
      };
      module.exports = AlphanumericData;
    }
  });

  // node_modules/qrcode/lib/core/byte-data.js
  var require_byte_data = __commonJS({
    "node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
      var Mode = require_mode();
      function ByteData(data) {
        this.mode = Mode.BYTE;
        if (typeof data === "string") {
          this.data = new TextEncoder().encode(data);
        } else {
          this.data = new Uint8Array(data);
        }
      }
      ByteData.getBitsLength = function getBitsLength(length) {
        return length * 8;
      };
      ByteData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      ByteData.prototype.getBitsLength = function getBitsLength() {
        return ByteData.getBitsLength(this.data.length);
      };
      ByteData.prototype.write = function(bitBuffer) {
        for (let i = 0, l = this.data.length; i < l; i++) {
          bitBuffer.put(this.data[i], 8);
        }
      };
      module.exports = ByteData;
    }
  });

  // node_modules/qrcode/lib/core/kanji-data.js
  var require_kanji_data = __commonJS({
    "node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
      var Mode = require_mode();
      var Utils = require_utils();
      function KanjiData(data) {
        this.mode = Mode.KANJI;
        this.data = data;
      }
      KanjiData.getBitsLength = function getBitsLength(length) {
        return length * 13;
      };
      KanjiData.prototype.getLength = function getLength() {
        return this.data.length;
      };
      KanjiData.prototype.getBitsLength = function getBitsLength() {
        return KanjiData.getBitsLength(this.data.length);
      };
      KanjiData.prototype.write = function(bitBuffer) {
        let i;
        for (i = 0; i < this.data.length; i++) {
          let value = Utils.toSJIS(this.data[i]);
          if (value >= 33088 && value <= 40956) {
            value -= 33088;
          } else if (value >= 57408 && value <= 60351) {
            value -= 49472;
          } else {
            throw new Error(
              "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
            );
          }
          value = (value >>> 8 & 255) * 192 + (value & 255);
          bitBuffer.put(value, 13);
        }
      };
      module.exports = KanjiData;
    }
  });

  // node_modules/dijkstrajs/dijkstra.js
  var require_dijkstra = __commonJS({
    "node_modules/dijkstrajs/dijkstra.js"(exports, module) {
      "use strict";
      var dijkstra = {
        single_source_shortest_paths: function(graph, s, d) {
          var predecessors = {};
          var costs = {};
          costs[s] = 0;
          var open = dijkstra.PriorityQueue.make();
          open.push(s, 0);
          var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
          while (!open.empty()) {
            closest = open.pop();
            u = closest.value;
            cost_of_s_to_u = closest.cost;
            adjacent_nodes = graph[u] || {};
            for (v in adjacent_nodes) {
              if (adjacent_nodes.hasOwnProperty(v)) {
                cost_of_e = adjacent_nodes[v];
                cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
                cost_of_s_to_v = costs[v];
                first_visit = typeof costs[v] === "undefined";
                if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                  costs[v] = cost_of_s_to_u_plus_cost_of_e;
                  open.push(v, cost_of_s_to_u_plus_cost_of_e);
                  predecessors[v] = u;
                }
              }
            }
          }
          if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
            var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
            throw new Error(msg);
          }
          return predecessors;
        },
        extract_shortest_path_from_predecessor_list: function(predecessors, d) {
          var nodes = [];
          var u = d;
          var predecessor;
          while (u) {
            nodes.push(u);
            predecessor = predecessors[u];
            u = predecessors[u];
          }
          nodes.reverse();
          return nodes;
        },
        find_path: function(graph, s, d) {
          var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
          return dijkstra.extract_shortest_path_from_predecessor_list(
            predecessors,
            d
          );
        },
        /**
         * A very naive priority queue implementation.
         */
        PriorityQueue: {
          make: function(opts) {
            var T = dijkstra.PriorityQueue, t = {}, key;
            opts = opts || {};
            for (key in T) {
              if (T.hasOwnProperty(key)) {
                t[key] = T[key];
              }
            }
            t.queue = [];
            t.sorter = opts.sorter || T.default_sorter;
            return t;
          },
          default_sorter: function(a, b) {
            return a.cost - b.cost;
          },
          /**
           * Add a new item to the queue and ensure the highest priority element
           * is at the front of the queue.
           */
          push: function(value, cost) {
            var item = { value, cost };
            this.queue.push(item);
            this.queue.sort(this.sorter);
          },
          /**
           * Return the highest priority element in the queue.
           */
          pop: function() {
            return this.queue.shift();
          },
          empty: function() {
            return this.queue.length === 0;
          }
        }
      };
      if (typeof module !== "undefined") {
        module.exports = dijkstra;
      }
    }
  });

  // node_modules/qrcode/lib/core/segments.js
  var require_segments = __commonJS({
    "node_modules/qrcode/lib/core/segments.js"(exports) {
      var Mode = require_mode();
      var NumericData = require_numeric_data();
      var AlphanumericData = require_alphanumeric_data();
      var ByteData = require_byte_data();
      var KanjiData = require_kanji_data();
      var Regex = require_regex();
      var Utils = require_utils();
      var dijkstra = require_dijkstra();
      function getStringByteLength(str) {
        return unescape(encodeURIComponent(str)).length;
      }
      function getSegments(regex, mode, str) {
        const segments = [];
        let result;
        while ((result = regex.exec(str)) !== null) {
          segments.push({
            data: result[0],
            index: result.index,
            mode,
            length: result[0].length
          });
        }
        return segments;
      }
      function getSegmentsFromString(dataStr) {
        const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
        const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
        let byteSegs;
        let kanjiSegs;
        if (Utils.isKanjiModeEnabled()) {
          byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
          kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
        } else {
          byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
          kanjiSegs = [];
        }
        const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
        return segs.sort(function(s1, s2) {
          return s1.index - s2.index;
        }).map(function(obj) {
          return {
            data: obj.data,
            mode: obj.mode,
            length: obj.length
          };
        });
      }
      function getSegmentBitsLength(length, mode) {
        switch (mode) {
          case Mode.NUMERIC:
            return NumericData.getBitsLength(length);
          case Mode.ALPHANUMERIC:
            return AlphanumericData.getBitsLength(length);
          case Mode.KANJI:
            return KanjiData.getBitsLength(length);
          case Mode.BYTE:
            return ByteData.getBitsLength(length);
        }
      }
      function mergeSegments(segs) {
        return segs.reduce(function(acc, curr) {
          const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
          if (prevSeg && prevSeg.mode === curr.mode) {
            acc[acc.length - 1].data += curr.data;
            return acc;
          }
          acc.push(curr);
          return acc;
        }, []);
      }
      function buildNodes(segs) {
        const nodes = [];
        for (let i = 0; i < segs.length; i++) {
          const seg = segs[i];
          switch (seg.mode) {
            case Mode.NUMERIC:
              nodes.push([
                seg,
                { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
                { data: seg.data, mode: Mode.BYTE, length: seg.length }
              ]);
              break;
            case Mode.ALPHANUMERIC:
              nodes.push([
                seg,
                { data: seg.data, mode: Mode.BYTE, length: seg.length }
              ]);
              break;
            case Mode.KANJI:
              nodes.push([
                seg,
                { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
              ]);
              break;
            case Mode.BYTE:
              nodes.push([
                { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
              ]);
          }
        }
        return nodes;
      }
      function buildGraph(nodes, version) {
        const table = {};
        const graph = { start: {} };
        let prevNodeIds = ["start"];
        for (let i = 0; i < nodes.length; i++) {
          const nodeGroup = nodes[i];
          const currentNodeIds = [];
          for (let j = 0; j < nodeGroup.length; j++) {
            const node = nodeGroup[j];
            const key = "" + i + j;
            currentNodeIds.push(key);
            table[key] = { node, lastCount: 0 };
            graph[key] = {};
            for (let n = 0; n < prevNodeIds.length; n++) {
              const prevNodeId = prevNodeIds[n];
              if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
                graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
                table[prevNodeId].lastCount += node.length;
              } else {
                if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
                graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
              }
            }
          }
          prevNodeIds = currentNodeIds;
        }
        for (let n = 0; n < prevNodeIds.length; n++) {
          graph[prevNodeIds[n]].end = 0;
        }
        return { map: graph, table };
      }
      function buildSingleSegment(data, modesHint) {
        let mode;
        const bestMode = Mode.getBestModeForData(data);
        mode = Mode.from(modesHint, bestMode);
        if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
          throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
        }
        if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
          mode = Mode.BYTE;
        }
        switch (mode) {
          case Mode.NUMERIC:
            return new NumericData(data);
          case Mode.ALPHANUMERIC:
            return new AlphanumericData(data);
          case Mode.KANJI:
            return new KanjiData(data);
          case Mode.BYTE:
            return new ByteData(data);
        }
      }
      exports.fromArray = function fromArray(array) {
        return array.reduce(function(acc, seg) {
          if (typeof seg === "string") {
            acc.push(buildSingleSegment(seg, null));
          } else if (seg.data) {
            acc.push(buildSingleSegment(seg.data, seg.mode));
          }
          return acc;
        }, []);
      };
      exports.fromString = function fromString(data, version) {
        const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
        const nodes = buildNodes(segs);
        const graph = buildGraph(nodes, version);
        const path = dijkstra.find_path(graph.map, "start", "end");
        const optimizedSegs = [];
        for (let i = 1; i < path.length - 1; i++) {
          optimizedSegs.push(graph.table[path[i]].node);
        }
        return exports.fromArray(mergeSegments(optimizedSegs));
      };
      exports.rawSplit = function rawSplit(data) {
        return exports.fromArray(
          getSegmentsFromString(data, Utils.isKanjiModeEnabled())
        );
      };
    }
  });

  // node_modules/qrcode/lib/core/qrcode.js
  var require_qrcode = __commonJS({
    "node_modules/qrcode/lib/core/qrcode.js"(exports) {
      var Utils = require_utils();
      var ECLevel = require_error_correction_level();
      var BitBuffer = require_bit_buffer();
      var BitMatrix = require_bit_matrix();
      var AlignmentPattern = require_alignment_pattern();
      var FinderPattern = require_finder_pattern();
      var MaskPattern = require_mask_pattern();
      var ECCode = require_error_correction_code();
      var ReedSolomonEncoder = require_reed_solomon_encoder();
      var Version = require_version();
      var FormatInfo = require_format_info();
      var Mode = require_mode();
      var Segments = require_segments();
      function setupFinderPattern(matrix, version) {
        const size = matrix.size;
        const pos = FinderPattern.getPositions(version);
        for (let i = 0; i < pos.length; i++) {
          const row = pos[i][0];
          const col = pos[i][1];
          for (let r = -1; r <= 7; r++) {
            if (row + r <= -1 || size <= row + r) continue;
            for (let c = -1; c <= 7; c++) {
              if (col + c <= -1 || size <= col + c) continue;
              if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
                matrix.set(row + r, col + c, true, true);
              } else {
                matrix.set(row + r, col + c, false, true);
              }
            }
          }
        }
      }
      function setupTimingPattern(matrix) {
        const size = matrix.size;
        for (let r = 8; r < size - 8; r++) {
          const value = r % 2 === 0;
          matrix.set(r, 6, value, true);
          matrix.set(6, r, value, true);
        }
      }
      function setupAlignmentPattern(matrix, version) {
        const pos = AlignmentPattern.getPositions(version);
        for (let i = 0; i < pos.length; i++) {
          const row = pos[i][0];
          const col = pos[i][1];
          for (let r = -2; r <= 2; r++) {
            for (let c = -2; c <= 2; c++) {
              if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
                matrix.set(row + r, col + c, true, true);
              } else {
                matrix.set(row + r, col + c, false, true);
              }
            }
          }
        }
      }
      function setupVersionInfo(matrix, version) {
        const size = matrix.size;
        const bits = Version.getEncodedBits(version);
        let row, col, mod;
        for (let i = 0; i < 18; i++) {
          row = Math.floor(i / 3);
          col = i % 3 + size - 8 - 3;
          mod = (bits >> i & 1) === 1;
          matrix.set(row, col, mod, true);
          matrix.set(col, row, mod, true);
        }
      }
      function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
        const size = matrix.size;
        const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
        let i, mod;
        for (i = 0; i < 15; i++) {
          mod = (bits >> i & 1) === 1;
          if (i < 6) {
            matrix.set(i, 8, mod, true);
          } else if (i < 8) {
            matrix.set(i + 1, 8, mod, true);
          } else {
            matrix.set(size - 15 + i, 8, mod, true);
          }
          if (i < 8) {
            matrix.set(8, size - i - 1, mod, true);
          } else if (i < 9) {
            matrix.set(8, 15 - i - 1 + 1, mod, true);
          } else {
            matrix.set(8, 15 - i - 1, mod, true);
          }
        }
        matrix.set(size - 8, 8, 1, true);
      }
      function setupData(matrix, data) {
        const size = matrix.size;
        let inc = -1;
        let row = size - 1;
        let bitIndex = 7;
        let byteIndex = 0;
        for (let col = size - 1; col > 0; col -= 2) {
          if (col === 6) col--;
          while (true) {
            for (let c = 0; c < 2; c++) {
              if (!matrix.isReserved(row, col - c)) {
                let dark = false;
                if (byteIndex < data.length) {
                  dark = (data[byteIndex] >>> bitIndex & 1) === 1;
                }
                matrix.set(row, col - c, dark);
                bitIndex--;
                if (bitIndex === -1) {
                  byteIndex++;
                  bitIndex = 7;
                }
              }
            }
            row += inc;
            if (row < 0 || size <= row) {
              row -= inc;
              inc = -inc;
              break;
            }
          }
        }
      }
      function createData(version, errorCorrectionLevel, segments) {
        const buffer = new BitBuffer();
        segments.forEach(function(data) {
          buffer.put(data.mode.bit, 4);
          buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
          data.write(buffer);
        });
        const totalCodewords = Utils.getSymbolTotalCodewords(version);
        const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
        const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
        if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
          buffer.put(0, 4);
        }
        while (buffer.getLengthInBits() % 8 !== 0) {
          buffer.putBit(0);
        }
        const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
        for (let i = 0; i < remainingByte; i++) {
          buffer.put(i % 2 ? 17 : 236, 8);
        }
        return createCodewords(buffer, version, errorCorrectionLevel);
      }
      function createCodewords(bitBuffer, version, errorCorrectionLevel) {
        const totalCodewords = Utils.getSymbolTotalCodewords(version);
        const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
        const dataTotalCodewords = totalCodewords - ecTotalCodewords;
        const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
        const blocksInGroup2 = totalCodewords % ecTotalBlocks;
        const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
        const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
        const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
        const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
        const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
        const rs = new ReedSolomonEncoder(ecCount);
        let offset = 0;
        const dcData = new Array(ecTotalBlocks);
        const ecData = new Array(ecTotalBlocks);
        let maxDataSize = 0;
        const buffer = new Uint8Array(bitBuffer.buffer);
        for (let b = 0; b < ecTotalBlocks; b++) {
          const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
          dcData[b] = buffer.slice(offset, offset + dataSize);
          ecData[b] = rs.encode(dcData[b]);
          offset += dataSize;
          maxDataSize = Math.max(maxDataSize, dataSize);
        }
        const data = new Uint8Array(totalCodewords);
        let index = 0;
        let i, r;
        for (i = 0; i < maxDataSize; i++) {
          for (r = 0; r < ecTotalBlocks; r++) {
            if (i < dcData[r].length) {
              data[index++] = dcData[r][i];
            }
          }
        }
        for (i = 0; i < ecCount; i++) {
          for (r = 0; r < ecTotalBlocks; r++) {
            data[index++] = ecData[r][i];
          }
        }
        return data;
      }
      function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
        let segments;
        if (Array.isArray(data)) {
          segments = Segments.fromArray(data);
        } else if (typeof data === "string") {
          let estimatedVersion = version;
          if (!estimatedVersion) {
            const rawSegments = Segments.rawSplit(data);
            estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
          }
          segments = Segments.fromString(data, estimatedVersion || 40);
        } else {
          throw new Error("Invalid data");
        }
        const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
        if (!bestVersion) {
          throw new Error("The amount of data is too big to be stored in a QR Code");
        }
        if (!version) {
          version = bestVersion;
        } else if (version < bestVersion) {
          throw new Error(
            "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
          );
        }
        const dataBits = createData(version, errorCorrectionLevel, segments);
        const moduleCount = Utils.getSymbolSize(version);
        const modules = new BitMatrix(moduleCount);
        setupFinderPattern(modules, version);
        setupTimingPattern(modules);
        setupAlignmentPattern(modules, version);
        setupFormatInfo(modules, errorCorrectionLevel, 0);
        if (version >= 7) {
          setupVersionInfo(modules, version);
        }
        setupData(modules, dataBits);
        if (isNaN(maskPattern)) {
          maskPattern = MaskPattern.getBestMask(
            modules,
            setupFormatInfo.bind(null, modules, errorCorrectionLevel)
          );
        }
        MaskPattern.applyMask(maskPattern, modules);
        setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
        return {
          modules,
          version,
          errorCorrectionLevel,
          maskPattern,
          segments
        };
      }
      exports.create = function create(data, options) {
        if (typeof data === "undefined" || data === "") {
          throw new Error("No input text");
        }
        let errorCorrectionLevel = ECLevel.M;
        let version;
        let mask;
        if (typeof options !== "undefined") {
          errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
          version = Version.from(options.version);
          mask = MaskPattern.from(options.maskPattern);
          if (options.toSJISFunc) {
            Utils.setToSJISFunction(options.toSJISFunc);
          }
        }
        return createSymbol(data, version, errorCorrectionLevel, mask);
      };
    }
  });

  // node_modules/qrcode/lib/renderer/utils.js
  var require_utils2 = __commonJS({
    "node_modules/qrcode/lib/renderer/utils.js"(exports) {
      function hex2rgba(hex) {
        if (typeof hex === "number") {
          hex = hex.toString();
        }
        if (typeof hex !== "string") {
          throw new Error("Color should be defined as hex string");
        }
        let hexCode = hex.slice().replace("#", "").split("");
        if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
          throw new Error("Invalid hex color: " + hex);
        }
        if (hexCode.length === 3 || hexCode.length === 4) {
          hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
            return [c, c];
          }));
        }
        if (hexCode.length === 6) hexCode.push("F", "F");
        const hexValue = parseInt(hexCode.join(""), 16);
        return {
          r: hexValue >> 24 & 255,
          g: hexValue >> 16 & 255,
          b: hexValue >> 8 & 255,
          a: hexValue & 255,
          hex: "#" + hexCode.slice(0, 6).join("")
        };
      }
      exports.getOptions = function getOptions(options) {
        if (!options) options = {};
        if (!options.color) options.color = {};
        const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
        const width = options.width && options.width >= 21 ? options.width : void 0;
        const scale = options.scale || 4;
        return {
          width,
          scale: width ? 4 : scale,
          margin,
          color: {
            dark: hex2rgba(options.color.dark || "#000000ff"),
            light: hex2rgba(options.color.light || "#ffffffff")
          },
          type: options.type,
          rendererOpts: options.rendererOpts || {}
        };
      };
      exports.getScale = function getScale(qrSize, opts) {
        return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
      };
      exports.getImageWidth = function getImageWidth(qrSize, opts) {
        const scale = exports.getScale(qrSize, opts);
        return Math.floor((qrSize + opts.margin * 2) * scale);
      };
      exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
        const size = qr.modules.size;
        const data = qr.modules.data;
        const scale = exports.getScale(size, opts);
        const symbolSize = Math.floor((size + opts.margin * 2) * scale);
        const scaledMargin = opts.margin * scale;
        const palette = [opts.color.light, opts.color.dark];
        for (let i = 0; i < symbolSize; i++) {
          for (let j = 0; j < symbolSize; j++) {
            let posDst = (i * symbolSize + j) * 4;
            let pxColor = opts.color.light;
            if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
              const iSrc = Math.floor((i - scaledMargin) / scale);
              const jSrc = Math.floor((j - scaledMargin) / scale);
              pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
            }
            imgData[posDst++] = pxColor.r;
            imgData[posDst++] = pxColor.g;
            imgData[posDst++] = pxColor.b;
            imgData[posDst] = pxColor.a;
          }
        }
      };
    }
  });

  // node_modules/qrcode/lib/renderer/canvas.js
  var require_canvas = __commonJS({
    "node_modules/qrcode/lib/renderer/canvas.js"(exports) {
      var Utils = require_utils2();
      function clearCanvas(ctx, canvas, size) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (!canvas.style) canvas.style = {};
        canvas.height = size;
        canvas.width = size;
        canvas.style.height = size + "px";
        canvas.style.width = size + "px";
      }
      function getCanvasElement() {
        try {
          return document.createElement("canvas");
        } catch (e) {
          throw new Error("You need to specify a canvas element");
        }
      }
      exports.render = function render(qrData, canvas, options) {
        let opts = options;
        let canvasEl = canvas;
        if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
          opts = canvas;
          canvas = void 0;
        }
        if (!canvas) {
          canvasEl = getCanvasElement();
        }
        opts = Utils.getOptions(opts);
        const size = Utils.getImageWidth(qrData.modules.size, opts);
        const ctx = canvasEl.getContext("2d");
        const image = ctx.createImageData(size, size);
        Utils.qrToImageData(image.data, qrData, opts);
        clearCanvas(ctx, canvasEl, size);
        ctx.putImageData(image, 0, 0);
        return canvasEl;
      };
      exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
        let opts = options;
        if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
          opts = canvas;
          canvas = void 0;
        }
        if (!opts) opts = {};
        const canvasEl = exports.render(qrData, canvas, opts);
        const type = opts.type || "image/png";
        const rendererOpts = opts.rendererOpts || {};
        return canvasEl.toDataURL(type, rendererOpts.quality);
      };
    }
  });

  // node_modules/qrcode/lib/renderer/svg-tag.js
  var require_svg_tag = __commonJS({
    "node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
      var Utils = require_utils2();
      function getColorAttrib(color, attrib) {
        const alpha = color.a / 255;
        const str = attrib + '="' + color.hex + '"';
        return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
      }
      function svgCmd(cmd, x, y) {
        let str = cmd + x;
        if (typeof y !== "undefined") str += " " + y;
        return str;
      }
      function qrToPath(data, size, margin) {
        let path = "";
        let moveBy = 0;
        let newRow = false;
        let lineLength = 0;
        for (let i = 0; i < data.length; i++) {
          const col = Math.floor(i % size);
          const row = Math.floor(i / size);
          if (!col && !newRow) newRow = true;
          if (data[i]) {
            lineLength++;
            if (!(i > 0 && col > 0 && data[i - 1])) {
              path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
              moveBy = 0;
              newRow = false;
            }
            if (!(col + 1 < size && data[i + 1])) {
              path += svgCmd("h", lineLength);
              lineLength = 0;
            }
          } else {
            moveBy++;
          }
        }
        return path;
      }
      exports.render = function render(qrData, options, cb) {
        const opts = Utils.getOptions(options);
        const size = qrData.modules.size;
        const data = qrData.modules.data;
        const qrcodesize = size + opts.margin * 2;
        const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
        const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
        const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
        const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
        const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
        if (typeof cb === "function") {
          cb(null, svgTag);
        }
        return svgTag;
      };
    }
  });

  // node_modules/qrcode/lib/browser.js
  var require_browser = __commonJS({
    "node_modules/qrcode/lib/browser.js"(exports) {
      var canPromise = require_can_promise();
      var QRCode2 = require_qrcode();
      var CanvasRenderer = require_canvas();
      var SvgRenderer = require_svg_tag();
      function renderCanvas(renderFunc, canvas, text, opts, cb) {
        const args = [].slice.call(arguments, 1);
        const argsNum = args.length;
        const isLastArgCb = typeof args[argsNum - 1] === "function";
        if (!isLastArgCb && !canPromise()) {
          throw new Error("Callback required as last argument");
        }
        if (isLastArgCb) {
          if (argsNum < 2) {
            throw new Error("Too few arguments provided");
          }
          if (argsNum === 2) {
            cb = text;
            text = canvas;
            canvas = opts = void 0;
          } else if (argsNum === 3) {
            if (canvas.getContext && typeof cb === "undefined") {
              cb = opts;
              opts = void 0;
            } else {
              cb = opts;
              opts = text;
              text = canvas;
              canvas = void 0;
            }
          }
        } else {
          if (argsNum < 1) {
            throw new Error("Too few arguments provided");
          }
          if (argsNum === 1) {
            text = canvas;
            canvas = opts = void 0;
          } else if (argsNum === 2 && !canvas.getContext) {
            opts = text;
            text = canvas;
            canvas = void 0;
          }
          return new Promise(function(resolve, reject) {
            try {
              const data = QRCode2.create(text, opts);
              resolve(renderFunc(data, canvas, opts));
            } catch (e) {
              reject(e);
            }
          });
        }
        try {
          const data = QRCode2.create(text, opts);
          cb(null, renderFunc(data, canvas, opts));
        } catch (e) {
          cb(e);
        }
      }
      exports.create = QRCode2.create;
      exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
      exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
      exports.toString = renderCanvas.bind(null, function(data, _, opts) {
        return SvgRenderer.render(data, opts);
      });
    }
  });

  // src/share-target.ts
  function isOpaqueShortUrl(url) {
    return url.protocol === "https:" && url.hostname === "b23.tv" && /^\/[0-9A-Za-z]+$/.test(url.pathname) && !url.search && !url.hash && !url.username && !url.password && !url.port;
  }
  function parseCanonicalVideoIdentity(rawUrl) {
    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      return null;
    }
    const match = url.pathname.match(/^\/video\/(BV[0-9A-Za-z]+)\/?$/i);
    if (url.protocol !== "https:" || url.hostname !== "www.bilibili.com" || !match) {
      return null;
    }
    return {
      bvid: match[1],
      part: url.searchParams.get("p"),
      timestamp: url.searchParams.get("t")
    };
  }
  function shareIdentity(rawUrl) {
    const identity = parseCanonicalVideoIdentity(rawUrl);
    if (!identity) throw new Error("\u5206\u4EAB\u94FE\u63A5\u65E0\u6548");
    return identity;
  }
  function parseShortLinkResponse(payload) {
    const response = payload;
    if (response?.code !== 0) {
      const detail = typeof response?.message === "string" && response.message ? `\uFF1A${response.message}` : "";
      throw new Error(`Bilibili \u77ED\u94FE\u8BF7\u6C42\u5931\u8D25${detail}`);
    }
    if (typeof response.data?.content !== "string" || !response.data.content.trim()) {
      throw new Error("Bilibili \u77ED\u94FE\u54CD\u5E94\u7F3A\u5C11\u6709\u6548\u94FE\u63A5");
    }
    for (const token of response.data.content.split(/\s+/)) {
      try {
        const url = new URL(token);
        if (isOpaqueShortUrl(url)) return url.toString();
      } catch {
      }
    }
    throw new Error("Bilibili \u77ED\u94FE\u54CD\u5E94\u7F3A\u5C11\u6709\u6548\u94FE\u63A5");
  }
  function selectShareTarget(canonicalTarget, attempt) {
    const expected = shareIdentity(canonicalTarget);
    if (attempt.status === "failed") {
      return {
        shareTarget: canonicalTarget,
        source: "canonical-fallback",
        fallbackReason: attempt.reason
      };
    }
    let resolved;
    try {
      resolved = shareIdentity(attempt.resolvedUrl);
    } catch {
      return {
        shareTarget: canonicalTarget,
        source: "canonical-fallback",
        fallbackReason: "\u77ED\u94FE\u843D\u70B9\u65E0\u6548"
      };
    }
    if (resolved.bvid.toUpperCase() !== expected.bvid.toUpperCase() || resolved.part !== expected.part || resolved.timestamp !== expected.timestamp) {
      return {
        shareTarget: canonicalTarget,
        source: "canonical-fallback",
        fallbackReason: "\u77ED\u94FE\u843D\u70B9\u4E0E\u672C\u6B21\u751F\u6210\u5FEB\u7167\u4E0D\u4E00\u81F4"
      };
    }
    return { shareTarget: attempt.shortUrl, source: "short" };
  }
  function buildCanonicalShareTarget(bvid, context, options) {
    const params = [];
    if (options.partShare) params.push(`p=${context.partNumber}`);
    if (options.timestampShare && Math.floor(context.playbackSeconds) >= 1) {
      params.push(`t=${Math.floor(context.playbackSeconds)}`);
    }
    const query = params.length > 0 ? `?${params.join("&")}` : "";
    return `https://www.bilibili.com/video/${bvid}/${query}`;
  }

  // src/bilibili.ts
  function readPageIdentity(url = location.href) {
    const identity = parseCanonicalVideoIdentity(url);
    if (!identity) return null;
    const rawPart = Number.parseInt(identity.part ?? "1", 10);
    return { bvid: identity.bvid, partNumber: Number.isSafeInteger(rawPart) && rawPart > 0 ? rawPart : 1 };
  }
  function findMainPlayer() {
    const candidates = Array.from(document.querySelectorAll(
      ".bpx-player-video-wrap video, .bilibili-player-video video, video"
    ));
    return candidates.filter((video) => video.isConnected).sort((left, right) => right.clientWidth * right.clientHeight - left.clientWidth * left.clientHeight)[0] ?? null;
  }
  function captureAndPausePlayback() {
    const player = findMainPlayer();
    if (!player) throw new Error("\u672A\u627E\u5230\u4E3B\u64AD\u653E\u5668\u3002Bilibili \u9875\u9762\u7ED3\u6784\u53EF\u80FD\u5DF2\u53D8\u5316\uFF0C\u8BF7\u5237\u65B0\u9875\u9762\u540E\u91CD\u8BD5\u3002");
    const wasPlaying = !player.paused && !player.ended;
    try {
      player.pause();
    } catch {
      throw new Error("\u65E0\u6CD5\u6682\u505C\u4E3B\u64AD\u653E\u5668\uFF0C\u8BF7\u68C0\u67E5\u9875\u9762\u64AD\u653E\u72B6\u6001\u540E\u91CD\u8BD5\u3002");
    }
    if (!player.paused) throw new Error("\u4E3B\u64AD\u653E\u5668\u672A\u80FD\u7A33\u5B9A\u6682\u505C\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    const identity = readPageIdentity();
    if (!identity) {
      if (wasPlaying) void player.play().catch(() => void 0);
      throw new Error("\u5F53\u524D\u9875\u9762\u4E0D\u662F\u53D7\u652F\u6301\u7684\u6807\u51C6\u89C6\u9891\u9875\uFF0C\u8BF7\u6253\u5F00 /video/BV... \u9875\u9762\u540E\u91CD\u8BD5\u3002");
    }
    const playbackSeconds = Math.max(0, Math.floor(player.currentTime || 0));
    return { ...identity, playbackSeconds, wasPlaying, player };
  }
  function gmTextRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: options.method ?? "GET",
        url,
        data: options.data,
        timeout: 15e3,
        anonymous: true,
        headers: { Referer: "https://www.bilibili.com/", ...options.headers },
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            reject(new Error(`\u8BF7\u6C42\u5931\u8D25\uFF08HTTP ${response.status}\uFF09`));
            return;
          }
          resolve(response.responseText);
        },
        ontimeout: () => reject(new Error("\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002")),
        onerror: () => reject(new Error("\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u8BD5\u3002"))
      });
    });
  }
  function gmBlobRequest(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url,
        responseType: "blob",
        timeout: 15e3,
        anonymous: true,
        headers: { Referer: "https://www.bilibili.com/" },
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            reject(new Error(`\u8BF7\u6C42\u5931\u8D25\uFF08HTTP ${response.status}\uFF09`));
            return;
          }
          resolve(response.response);
        },
        ontimeout: () => reject(new Error("\u8BF7\u6C42\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002")),
        onerror: () => reject(new Error("\u7F51\u7EDC\u8BF7\u6C42\u5931\u8D25\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u540E\u91CD\u8BD5\u3002"))
      });
    });
  }
  function gmResolvedUrlRequest(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "HEAD",
        url,
        redirect: "follow",
        timeout: 15e3,
        anonymous: true,
        headers: { Referer: "https://www.bilibili.com/" },
        onload(response) {
          if (response.status < 200 || response.status >= 300) {
            reject(new Error(`\u77ED\u94FE\u89E3\u6790\u5931\u8D25\uFF08HTTP ${response.status}\uFF09`));
            return;
          }
          if (!response.finalUrl) {
            reject(new Error("\u77ED\u94FE\u89E3\u6790\u672A\u8FD4\u56DE\u843D\u70B9"));
            return;
          }
          resolve(response.finalUrl);
        },
        ontimeout: () => reject(new Error("\u77ED\u94FE\u89E3\u6790\u8D85\u65F6\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5")),
        onerror: () => reject(new Error("\u77ED\u94FE\u89E3\u6790\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5"))
      });
    });
  }
  function requiredText(value, label) {
    if (typeof value !== "string" || !value.trim()) throw new Error(`\u89C6\u9891\u4FE1\u606F\u7F3A\u5C11${label}\u3002`);
    return value.trim();
  }
  function requiredPositiveInteger(value, label) {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) {
      throw new Error(`\u89C6\u9891\u4FE1\u606F\u7F3A\u5C11${label}\u3002`);
    }
    return value;
  }
  function statistic(value) {
    return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : null;
  }
  function parsePartInformation(pages, expectedPartNumber) {
    if (!Array.isArray(pages)) return { partTitle: null, partIdentified: false };
    const current = pages.find(
      (page) => typeof page === "object" && page !== null && page.page === expectedPartNumber
    );
    if (!current) return { partTitle: null, partIdentified: false };
    const partTitle = typeof current.part === "string" && current.part.trim() ? current.part.trim() : null;
    return { partTitle, partIdentified: true };
  }
  function parseVideoApiResponse(payload, expectedBvid, expectedPartNumber = 1) {
    const response = payload;
    if (response?.code !== 0 || !response.data) {
      const detail = typeof response?.message === "string" && response.message ? `\uFF1A${response.message}` : "";
      throw new Error(`Bilibili \u89C6\u9891\u4FE1\u606F\u8BF7\u6C42\u5931\u8D25${detail}`);
    }
    const data = response.data;
    const bvid = requiredText(data.bvid, "BV \u6807\u8BC6");
    if (bvid.toUpperCase() !== expectedBvid.toUpperCase()) throw new Error("\u89C6\u9891\u8EAB\u4EFD\u6821\u9A8C\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    const partInformation = parsePartInformation(data.pages, expectedPartNumber);
    return {
      bvid,
      aid: requiredPositiveInteger(data.aid, "AV \u6807\u8BC6"),
      coverUrl: requiredText(data.pic, "\u89C6\u9891\u5C01\u9762"),
      title: requiredText(data.title, "\u89C6\u9891\u6807\u9898"),
      uploader: requiredText(data.owner?.name, "UP \u4E3B"),
      partTitle: partInformation.partTitle,
      partIdentified: partInformation.partIdentified,
      stats: {
        views: statistic(data.stat?.view),
        likes: statistic(data.stat?.like),
        coins: statistic(data.stat?.coin),
        favorites: statistic(data.stat?.favorite)
      }
    };
  }
  function isUsableCover(width, height) {
    return Number.isFinite(width) && Number.isFinite(height) && width >= 160 && height >= 90;
  }
  async function blobToImageDataUrl(blob) {
    if (blob.size === 0 || blob.type && !blob.type.startsWith("image/")) {
      throw new Error("Bilibili \u8FD4\u56DE\u7684\u89C6\u9891\u5C01\u9762\u65E0\u6548\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("\u89C6\u9891\u5C01\u9762\u8BFB\u53D6\u5931\u8D25\u3002"));
      reader.readAsDataURL(blob);
    });
    const image = new Image();
    image.src = dataUrl;
    try {
      await image.decode();
    } catch {
      throw new Error("Bilibili \u8FD4\u56DE\u7684\u89C6\u9891\u5C01\u9762\u65E0\u6CD5\u89E3\u7801\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    }
    if (!isUsableCover(image.naturalWidth, image.naturalHeight)) throw new Error("Bilibili \u8FD4\u56DE\u7684\u89C6\u9891\u5C01\u9762\u5C3A\u5BF8\u4E0D\u53EF\u7528\uFF0C\u8BF7\u91CD\u8BD5\u3002");
    return dataUrl;
  }
  async function loadCover(coverUrl) {
    try {
      const blob = await gmBlobRequest(coverUrl.replace(/^http:/, "https:"));
      return { dataUrl: await blobToImageDataUrl(blob), unavailable: false };
    } catch {
      return { dataUrl: "", unavailable: true };
    }
  }
  async function fetchGenerationSnapshot(capture) {
    const endpoint = `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(capture.bvid)}`;
    let payload;
    try {
      payload = JSON.parse(await gmTextRequest(endpoint));
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error("Bilibili \u8FD4\u56DE\u4E86\u65E0\u6CD5\u89E3\u6790\u7684\u89C6\u9891\u4FE1\u606F\uFF0C\u8BF7\u91CD\u8BD5\u3002");
      throw error;
    }
    const video = parseVideoApiResponse(payload, capture.bvid, capture.partNumber);
    const cover = await loadCover(video.coverUrl);
    return {
      bvid: video.bvid,
      aid: video.aid,
      coverDataUrl: cover.dataUrl,
      coverUnavailable: cover.unavailable,
      title: video.title,
      uploader: video.uploader,
      partNumber: capture.partNumber,
      partTitle: video.partTitle,
      partIdentified: video.partIdentified,
      playbackSeconds: capture.playbackSeconds,
      wasPlaying: capture.wasPlaying,
      stats: video.stats
    };
  }
  async function fetchValidatedShareTarget(snapshot, canonicalTarget) {
    try {
      const form = new URLSearchParams({
        build: "6500300",
        buvid: "bsp-userscript-public",
        oid: snapshot.aid.toString(),
        platform: "web",
        share_channel: "COPY",
        share_id: "main.ugc-video-detail.0.0.pv",
        share_mode: "3",
        share_origin: "vinfo_share"
      });
      const responseText = await gmTextRequest("https://api.bilibili.com/x/share/click", {
        method: "POST",
        data: form.toString(),
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" }
      });
      let payload;
      try {
        payload = JSON.parse(responseText);
      } catch {
        throw new Error("Bilibili \u8FD4\u56DE\u4E86\u65E0\u6CD5\u89E3\u6790\u7684\u77ED\u94FE\u54CD\u5E94");
      }
      const shortUrl = parseShortLinkResponse(payload);
      const resolvedUrl = await gmResolvedUrlRequest(shortUrl);
      return selectShareTarget(canonicalTarget, { status: "resolved", shortUrl, resolvedUrl });
    } catch (error) {
      const reason = error instanceof Error ? error.message : "\u77ED\u94FE\u6682\u65F6\u4E0D\u53EF\u7528";
      return selectShareTarget(canonicalTarget, { status: "failed", reason });
    }
  }
  async function fetchGenerationResources(capture) {
    const snapshot = await fetchGenerationSnapshot(capture);
    const canonicalTarget = buildCanonicalShareTarget(
      snapshot.bvid,
      snapshot,
      { partShare: false, timestampShare: false }
    );
    const targetSelection = await fetchValidatedShareTarget(snapshot, canonicalTarget);
    return { snapshot, targetSelection };
  }
  function restorePlayback(capture) {
    if (!capture.wasPlaying || !capture.player.isConnected) return;
    const current = readPageIdentity();
    if (!current || current.bvid.toUpperCase() !== capture.bvid.toUpperCase() || current.partNumber !== capture.partNumber) return;
    void capture.player.play().catch(() => void 0);
  }

  // src/options.ts
  function createDefaultShareOptions() {
    return {
      theme: "A",
      partShare: false,
      timestampShare: false,
      detailedText: false,
      markdownText: false
    };
  }
  function resolveRememberedPreferences(stored) {
    const record = typeof stored === "object" && stored !== null ? stored : {};
    return {
      theme: record.theme === "B" ? "B" : "A",
      detailedText: record.detailedText === true,
      markdownText: record.markdownText === true
    };
  }
  function createPanelShareOptions(storedPreferences = null) {
    const remembered = resolveRememberedPreferences(storedPreferences);
    return {
      theme: remembered.theme,
      partShare: false,
      timestampShare: false,
      detailedText: remembered.detailedText,
      markdownText: remembered.markdownText
    };
  }
  function loadRememberedPreferences() {
    const stored = typeof GM_getValue === "function" ? GM_getValue("bsp-panel-preferences", null) : null;
    return resolveRememberedPreferences(stored);
  }
  function canEnablePartShare(context) {
    return context.partIdentified;
  }
  function canEnableTimestampShare(context) {
    return context.partIdentified && Math.floor(context.playbackSeconds) >= 1;
  }
  function togglePartShare(options, context) {
    if (!canEnablePartShare(context)) return options;
    const partShare = !options.partShare;
    return {
      ...options,
      partShare,
      timestampShare: partShare ? options.timestampShare : false
    };
  }
  function toggleTimestampShare(options, context) {
    if (!canEnableTimestampShare(context)) return options;
    const timestampShare = !options.timestampShare;
    return {
      ...options,
      timestampShare,
      partShare: timestampShare && context.partNumber > 1 ? true : options.partShare
    };
  }

  // src/ui/icons.ts
  var ICON_PATHS = {
    poster: ["M4 5.5h16v13H4z", "M7 15l3.2-3.4 2.4 2.4 1.8-1.9 2.6 2.7", "M8.4 8.4h.01"],
    copy: ["M8 8h11v11H8z", "M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"],
    download: ["M12 3v11", "m7 10 5 5 5-5", "M4 19h16"],
    "copy-text": ["M8 9h8", "M8 13h5", "M4 4h16v16H4z"],
    combined: ["M3 5h12v9H3z", "M6 9h6", "M6 12h4", "M17 9v10a2 2 0 0 1-2 2H7"],
    list: ["M8 6h12", "M8 12h12", "M8 18h12", "M4 6h.01", "M4 12h.01", "M4 18h.01"],
    clock: ["M12 12a9 9 0 1 1 0 .01", "M12 7v5l3 2"],
    detail: ["M4 7h16", "M4 12h10", "M4 17h16", "m16 13 2 2 4-4"],
    markdown: ["M5 16V8l3 5 3-5v8", "M15 8h4l-4 4 4 4h-4"],
    close: ["M6 6l12 12", "M18 6 6 18"]
  };
  function createIcon(name) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    for (const d of ICON_PATHS[name]) {
      const path = document.createElementNS(svg.namespaceURI, "path");
      path.setAttribute("d", d);
      svg.append(path);
    }
    return svg;
  }
  function posterIcon() {
    return createIcon("poster");
  }

  // src/ui/tokens.ts
  function selectThemeSurfaceClasses(theme) {
    if (theme === "B") return { panel: "bsp-theme-b", entry: "bsp-entry-b" };
    return { panel: null, entry: null };
  }

  // src/ui/entry.ts
  var ENTRY_ID = "bsp-entry";
  var TOOLBAR_ANCHOR_SELECTORS = [
    "#arc_toolbar_report .toolbar-left-item-wrap",
    ".video-toolbar-left .toolbar-left-item-wrap",
    ".video-toolbar-container .toolbar-left-item-wrap",
    "#arc_toolbar_report [class*='toolbar-left-item-wrap']"
  ];
  var LEGACY_SHARE_WRAP_SELECTORS = "#arc_toolbar_report .video-share-wrap, .video-toolbar-left .video-share-wrap, .video-toolbar-container .video-share-wrap";
  function findToolbarAnchor() {
    for (const selector of TOOLBAR_ANCHOR_SELECTORS) {
      const candidate = document.querySelector(selector);
      if (candidate) return candidate;
    }
    const legacyShareWrap = document.querySelector(LEGACY_SHARE_WRAP_SELECTORS);
    return legacyShareWrap?.parentElement ?? null;
  }
  function createSharePosterEntry(theme, onOpen) {
    const button = document.createElement("button");
    button.id = ENTRY_ID;
    button.type = "button";
    button.title = "\u751F\u6210\u5206\u4EAB\u6D77\u62A5";
    button.append(posterIcon(), document.createTextNode("\u751F\u6210\u6D77\u62A5"));
    button.addEventListener("click", onOpen);
    const surface = selectThemeSurfaceClasses(theme);
    if (surface.entry) button.classList.add(surface.entry);
    return button;
  }
  function removeSharePosterEntry() {
    document.getElementById(ENTRY_ID)?.remove();
  }
  function mountSharePosterEntry(theme, onOpen) {
    if (document.getElementById(ENTRY_ID)) return false;
    const anchor = findToolbarAnchor();
    if (!anchor?.parentElement) return false;
    anchor.insertAdjacentElement("afterend", createSharePosterEntry(theme, onOpen));
    return true;
  }
  function setEntryTheme(theme) {
    const entry = document.getElementById(ENTRY_ID);
    if (!entry) return;
    const surface = selectThemeSurfaceClasses(theme);
    entry.classList.toggle("bsp-entry-b", surface.entry !== null);
  }

  // node_modules/html-to-image/es/util.js
  function resolveUrl(url, baseUrl) {
    if (url.match(/^[a-z]+:\/\//i)) {
      return url;
    }
    if (url.match(/^\/\//)) {
      return window.location.protocol + url;
    }
    if (url.match(/^[a-z]+:/i)) {
      return url;
    }
    const doc = document.implementation.createHTMLDocument();
    const base = doc.createElement("base");
    const a = doc.createElement("a");
    doc.head.appendChild(base);
    doc.body.appendChild(a);
    if (baseUrl) {
      base.href = baseUrl;
    }
    a.href = url;
    return a.href;
  }
  var uuid = /* @__PURE__ */ (() => {
    let counter = 0;
    const random = () => (
      // eslint-disable-next-line no-bitwise
      `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4)
    );
    return () => {
      counter += 1;
      return `u${random()}${counter}`;
    };
  })();
  function toArray(arrayLike) {
    const arr = [];
    for (let i = 0, l = arrayLike.length; i < l; i++) {
      arr.push(arrayLike[i]);
    }
    return arr;
  }
  var styleProps = null;
  function getStyleProperties(options = {}) {
    if (styleProps) {
      return styleProps;
    }
    if (options.includeStyleProperties) {
      styleProps = options.includeStyleProperties;
      return styleProps;
    }
    styleProps = toArray(window.getComputedStyle(document.documentElement));
    return styleProps;
  }
  function px(node, styleProperty) {
    const win = node.ownerDocument.defaultView || window;
    const val = win.getComputedStyle(node).getPropertyValue(styleProperty);
    return val ? parseFloat(val.replace("px", "")) : 0;
  }
  function getNodeWidth(node) {
    const leftBorder = px(node, "border-left-width");
    const rightBorder = px(node, "border-right-width");
    return node.clientWidth + leftBorder + rightBorder;
  }
  function getNodeHeight(node) {
    const topBorder = px(node, "border-top-width");
    const bottomBorder = px(node, "border-bottom-width");
    return node.clientHeight + topBorder + bottomBorder;
  }
  function getImageSize(targetNode, options = {}) {
    const width = options.width || getNodeWidth(targetNode);
    const height = options.height || getNodeHeight(targetNode);
    return { width, height };
  }
  function getPixelRatio() {
    let ratio;
    let FINAL_PROCESS;
    try {
      FINAL_PROCESS = process;
    } catch (e) {
    }
    const val = FINAL_PROCESS && FINAL_PROCESS.env ? FINAL_PROCESS.env.devicePixelRatio : null;
    if (val) {
      ratio = parseInt(val, 10);
      if (Number.isNaN(ratio)) {
        ratio = 1;
      }
    }
    return ratio || window.devicePixelRatio || 1;
  }
  var canvasDimensionLimit = 16384;
  function checkCanvasDimensions(canvas) {
    if (canvas.width > canvasDimensionLimit || canvas.height > canvasDimensionLimit) {
      if (canvas.width > canvasDimensionLimit && canvas.height > canvasDimensionLimit) {
        if (canvas.width > canvas.height) {
          canvas.height *= canvasDimensionLimit / canvas.width;
          canvas.width = canvasDimensionLimit;
        } else {
          canvas.width *= canvasDimensionLimit / canvas.height;
          canvas.height = canvasDimensionLimit;
        }
      } else if (canvas.width > canvasDimensionLimit) {
        canvas.height *= canvasDimensionLimit / canvas.width;
        canvas.width = canvasDimensionLimit;
      } else {
        canvas.width *= canvasDimensionLimit / canvas.height;
        canvas.height = canvasDimensionLimit;
      }
    }
  }
  function createImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        img.decode().then(() => {
          requestAnimationFrame(() => resolve(img));
        });
      };
      img.onerror = reject;
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.src = url;
    });
  }
  async function svgToDataURL(svg) {
    return Promise.resolve().then(() => new XMLSerializer().serializeToString(svg)).then(encodeURIComponent).then((html) => `data:image/svg+xml;charset=utf-8,${html}`);
  }
  async function nodeToDataURL(node, width, height) {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(xmlns, "svg");
    const foreignObject = document.createElementNS(xmlns, "foreignObject");
    svg.setAttribute("width", `${width}`);
    svg.setAttribute("height", `${height}`);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    foreignObject.setAttribute("width", "100%");
    foreignObject.setAttribute("height", "100%");
    foreignObject.setAttribute("x", "0");
    foreignObject.setAttribute("y", "0");
    foreignObject.setAttribute("externalResourcesRequired", "true");
    svg.appendChild(foreignObject);
    foreignObject.appendChild(node);
    return svgToDataURL(svg);
  }
  var isInstanceOfElement = (node, instance) => {
    if (node instanceof instance)
      return true;
    const nodePrototype = Object.getPrototypeOf(node);
    if (nodePrototype === null)
      return false;
    return nodePrototype.constructor.name === instance.name || isInstanceOfElement(nodePrototype, instance);
  };

  // node_modules/html-to-image/es/clone-pseudos.js
  function formatCSSText(style) {
    const content = style.getPropertyValue("content");
    return `${style.cssText} content: '${content.replace(/'|"/g, "")}';`;
  }
  function formatCSSProperties(style, options) {
    return getStyleProperties(options).map((name) => {
      const value = style.getPropertyValue(name);
      const priority = style.getPropertyPriority(name);
      return `${name}: ${value}${priority ? " !important" : ""};`;
    }).join(" ");
  }
  function getPseudoElementStyle(className, pseudo, style, options) {
    const selector = `.${className}:${pseudo}`;
    const cssText = style.cssText ? formatCSSText(style) : formatCSSProperties(style, options);
    return document.createTextNode(`${selector}{${cssText}}`);
  }
  function clonePseudoElement(nativeNode, clonedNode, pseudo, options) {
    const style = window.getComputedStyle(nativeNode, pseudo);
    const content = style.getPropertyValue("content");
    if (content === "" || content === "none") {
      return;
    }
    const className = uuid();
    try {
      clonedNode.className = `${clonedNode.className} ${className}`;
    } catch (err) {
      return;
    }
    const styleElement = document.createElement("style");
    styleElement.appendChild(getPseudoElementStyle(className, pseudo, style, options));
    clonedNode.appendChild(styleElement);
  }
  function clonePseudoElements(nativeNode, clonedNode, options) {
    clonePseudoElement(nativeNode, clonedNode, ":before", options);
    clonePseudoElement(nativeNode, clonedNode, ":after", options);
  }

  // node_modules/html-to-image/es/mimes.js
  var WOFF = "application/font-woff";
  var JPEG = "image/jpeg";
  var mimes = {
    woff: WOFF,
    woff2: WOFF,
    ttf: "application/font-truetype",
    eot: "application/vnd.ms-fontobject",
    png: "image/png",
    jpg: JPEG,
    jpeg: JPEG,
    gif: "image/gif",
    tiff: "image/tiff",
    svg: "image/svg+xml",
    webp: "image/webp"
  };
  function getExtension(url) {
    const match = /\.([^./]*?)$/g.exec(url);
    return match ? match[1] : "";
  }
  function getMimeType(url) {
    const extension = getExtension(url).toLowerCase();
    return mimes[extension] || "";
  }

  // node_modules/html-to-image/es/dataurl.js
  function getContentFromDataUrl(dataURL) {
    return dataURL.split(/,/)[1];
  }
  function isDataUrl(url) {
    return url.search(/^(data:)/) !== -1;
  }
  function makeDataUrl(content, mimeType) {
    return `data:${mimeType};base64,${content}`;
  }
  async function fetchAsDataURL(url, init, process2) {
    const res = await fetch(url, init);
    if (res.status === 404) {
      throw new Error(`Resource "${res.url}" not found`);
    }
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => {
        try {
          resolve(process2({ res, result: reader.result }));
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(blob);
    });
  }
  var cache = {};
  function getCacheKey(url, contentType, includeQueryParams) {
    let key = url.replace(/\?.*/, "");
    if (includeQueryParams) {
      key = url;
    }
    if (/ttf|otf|eot|woff2?/i.test(key)) {
      key = key.replace(/.*\//, "");
    }
    return contentType ? `[${contentType}]${key}` : key;
  }
  async function resourceToDataURL(resourceUrl, contentType, options) {
    const cacheKey = getCacheKey(resourceUrl, contentType, options.includeQueryParams);
    if (cache[cacheKey] != null) {
      return cache[cacheKey];
    }
    if (options.cacheBust) {
      resourceUrl += (/\?/.test(resourceUrl) ? "&" : "?") + (/* @__PURE__ */ new Date()).getTime();
    }
    let dataURL;
    try {
      const content = await fetchAsDataURL(resourceUrl, options.fetchRequestInit, ({ res, result }) => {
        if (!contentType) {
          contentType = res.headers.get("Content-Type") || "";
        }
        return getContentFromDataUrl(result);
      });
      dataURL = makeDataUrl(content, contentType);
    } catch (error) {
      dataURL = options.imagePlaceholder || "";
      let msg = `Failed to fetch resource: ${resourceUrl}`;
      if (error) {
        msg = typeof error === "string" ? error : error.message;
      }
      if (msg) {
        console.warn(msg);
      }
    }
    cache[cacheKey] = dataURL;
    return dataURL;
  }

  // node_modules/html-to-image/es/clone-node.js
  async function cloneCanvasElement(canvas) {
    const dataURL = canvas.toDataURL();
    if (dataURL === "data:,") {
      return canvas.cloneNode(false);
    }
    return createImage(dataURL);
  }
  async function cloneVideoElement(video, options) {
    if (video.currentSrc) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = video.clientWidth;
      canvas.height = video.clientHeight;
      ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataURL2 = canvas.toDataURL();
      return createImage(dataURL2);
    }
    const poster = video.poster;
    const contentType = getMimeType(poster);
    const dataURL = await resourceToDataURL(poster, contentType, options);
    return createImage(dataURL);
  }
  async function cloneIFrameElement(iframe, options) {
    var _a;
    try {
      if ((_a = iframe === null || iframe === void 0 ? void 0 : iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.body) {
        return await cloneNode(iframe.contentDocument.body, options, true);
      }
    } catch (_b) {
    }
    return iframe.cloneNode(false);
  }
  async function cloneSingleNode(node, options) {
    if (isInstanceOfElement(node, HTMLCanvasElement)) {
      return cloneCanvasElement(node);
    }
    if (isInstanceOfElement(node, HTMLVideoElement)) {
      return cloneVideoElement(node, options);
    }
    if (isInstanceOfElement(node, HTMLIFrameElement)) {
      return cloneIFrameElement(node, options);
    }
    return node.cloneNode(isSVGElement(node));
  }
  var isSlotElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SLOT";
  var isSVGElement = (node) => node.tagName != null && node.tagName.toUpperCase() === "SVG";
  async function cloneChildren(nativeNode, clonedNode, options) {
    var _a, _b;
    if (isSVGElement(clonedNode)) {
      return clonedNode;
    }
    let children = [];
    if (isSlotElement(nativeNode) && nativeNode.assignedNodes) {
      children = toArray(nativeNode.assignedNodes());
    } else if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && ((_a = nativeNode.contentDocument) === null || _a === void 0 ? void 0 : _a.body)) {
      children = toArray(nativeNode.contentDocument.body.childNodes);
    } else {
      children = toArray(((_b = nativeNode.shadowRoot) !== null && _b !== void 0 ? _b : nativeNode).childNodes);
    }
    if (children.length === 0 || isInstanceOfElement(nativeNode, HTMLVideoElement)) {
      return clonedNode;
    }
    await children.reduce((deferred, child) => deferred.then(() => cloneNode(child, options)).then((clonedChild) => {
      if (clonedChild) {
        clonedNode.appendChild(clonedChild);
      }
    }), Promise.resolve());
    return clonedNode;
  }
  function cloneCSSStyle(nativeNode, clonedNode, options) {
    const targetStyle = clonedNode.style;
    if (!targetStyle) {
      return;
    }
    const sourceStyle = window.getComputedStyle(nativeNode);
    if (sourceStyle.cssText) {
      targetStyle.cssText = sourceStyle.cssText;
      targetStyle.transformOrigin = sourceStyle.transformOrigin;
    } else {
      getStyleProperties(options).forEach((name) => {
        let value = sourceStyle.getPropertyValue(name);
        if (name === "font-size" && value.endsWith("px")) {
          const reducedFont = Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
          value = `${reducedFont}px`;
        }
        if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && name === "display" && value === "inline") {
          value = "block";
        }
        if (name === "d" && clonedNode.getAttribute("d")) {
          value = `path(${clonedNode.getAttribute("d")})`;
        }
        targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
      });
    }
  }
  function cloneInputValue(nativeNode, clonedNode) {
    if (isInstanceOfElement(nativeNode, HTMLTextAreaElement)) {
      clonedNode.innerHTML = nativeNode.value;
    }
    if (isInstanceOfElement(nativeNode, HTMLInputElement)) {
      clonedNode.setAttribute("value", nativeNode.value);
    }
  }
  function cloneSelectValue(nativeNode, clonedNode) {
    if (isInstanceOfElement(nativeNode, HTMLSelectElement)) {
      const clonedSelect = clonedNode;
      const selectedOption = Array.from(clonedSelect.children).find((child) => nativeNode.value === child.getAttribute("value"));
      if (selectedOption) {
        selectedOption.setAttribute("selected", "");
      }
    }
  }
  function decorate(nativeNode, clonedNode, options) {
    if (isInstanceOfElement(clonedNode, Element)) {
      cloneCSSStyle(nativeNode, clonedNode, options);
      clonePseudoElements(nativeNode, clonedNode, options);
      cloneInputValue(nativeNode, clonedNode);
      cloneSelectValue(nativeNode, clonedNode);
    }
    return clonedNode;
  }
  async function ensureSVGSymbols(clone, options) {
    const uses = clone.querySelectorAll ? clone.querySelectorAll("use") : [];
    if (uses.length === 0) {
      return clone;
    }
    const processedDefs = {};
    for (let i = 0; i < uses.length; i++) {
      const use = uses[i];
      const id = use.getAttribute("xlink:href");
      if (id) {
        const exist = clone.querySelector(id);
        const definition = document.querySelector(id);
        if (!exist && definition && !processedDefs[id]) {
          processedDefs[id] = await cloneNode(definition, options, true);
        }
      }
    }
    const nodes = Object.values(processedDefs);
    if (nodes.length) {
      const ns = "http://www.w3.org/1999/xhtml";
      const svg = document.createElementNS(ns, "svg");
      svg.setAttribute("xmlns", ns);
      svg.style.position = "absolute";
      svg.style.width = "0";
      svg.style.height = "0";
      svg.style.overflow = "hidden";
      svg.style.display = "none";
      const defs = document.createElementNS(ns, "defs");
      svg.appendChild(defs);
      for (let i = 0; i < nodes.length; i++) {
        defs.appendChild(nodes[i]);
      }
      clone.appendChild(svg);
    }
    return clone;
  }
  async function cloneNode(node, options, isRoot) {
    if (!isRoot && options.filter && !options.filter(node)) {
      return null;
    }
    return Promise.resolve(node).then((clonedNode) => cloneSingleNode(clonedNode, options)).then((clonedNode) => cloneChildren(node, clonedNode, options)).then((clonedNode) => decorate(node, clonedNode, options)).then((clonedNode) => ensureSVGSymbols(clonedNode, options));
  }

  // node_modules/html-to-image/es/embed-resources.js
  var URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
  var URL_WITH_FORMAT_REGEX = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
  var FONT_SRC_REGEX = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
  function toRegex(url) {
    const escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp(`(url\\(['"]?)(${escaped})(['"]?\\))`, "g");
  }
  function parseURLs(cssText) {
    const urls = [];
    cssText.replace(URL_REGEX, (raw, quotation, url) => {
      urls.push(url);
      return raw;
    });
    return urls.filter((url) => !isDataUrl(url));
  }
  async function embed(cssText, resourceURL, baseURL, options, getContentFromUrl) {
    try {
      const resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;
      const contentType = getMimeType(resourceURL);
      let dataURL;
      if (getContentFromUrl) {
        const content = await getContentFromUrl(resolvedURL);
        dataURL = makeDataUrl(content, contentType);
      } else {
        dataURL = await resourceToDataURL(resolvedURL, contentType, options);
      }
      return cssText.replace(toRegex(resourceURL), `$1${dataURL}$3`);
    } catch (error) {
    }
    return cssText;
  }
  function filterPreferredFontFormat(str, { preferredFontFormat }) {
    return !preferredFontFormat ? str : str.replace(FONT_SRC_REGEX, (match) => {
      while (true) {
        const [src, , format] = URL_WITH_FORMAT_REGEX.exec(match) || [];
        if (!format) {
          return "";
        }
        if (format === preferredFontFormat) {
          return `src: ${src};`;
        }
      }
    });
  }
  function shouldEmbed(url) {
    return url.search(URL_REGEX) !== -1;
  }
  async function embedResources(cssText, baseUrl, options) {
    if (!shouldEmbed(cssText)) {
      return cssText;
    }
    const filteredCSSText = filterPreferredFontFormat(cssText, options);
    const urls = parseURLs(filteredCSSText);
    return urls.reduce((deferred, url) => deferred.then((css) => embed(css, url, baseUrl, options)), Promise.resolve(filteredCSSText));
  }

  // node_modules/html-to-image/es/embed-images.js
  async function embedProp(propName, node, options) {
    var _a;
    const propValue = (_a = node.style) === null || _a === void 0 ? void 0 : _a.getPropertyValue(propName);
    if (propValue) {
      const cssString = await embedResources(propValue, null, options);
      node.style.setProperty(propName, cssString, node.style.getPropertyPriority(propName));
      return true;
    }
    return false;
  }
  async function embedBackground(clonedNode, options) {
    ;
    await embedProp("background", clonedNode, options) || await embedProp("background-image", clonedNode, options);
    await embedProp("mask", clonedNode, options) || await embedProp("-webkit-mask", clonedNode, options) || await embedProp("mask-image", clonedNode, options) || await embedProp("-webkit-mask-image", clonedNode, options);
  }
  async function embedImageNode(clonedNode, options) {
    const isImageElement = isInstanceOfElement(clonedNode, HTMLImageElement);
    if (!(isImageElement && !isDataUrl(clonedNode.src)) && !(isInstanceOfElement(clonedNode, SVGImageElement) && !isDataUrl(clonedNode.href.baseVal))) {
      return;
    }
    const url = isImageElement ? clonedNode.src : clonedNode.href.baseVal;
    const dataURL = await resourceToDataURL(url, getMimeType(url), options);
    await new Promise((resolve, reject) => {
      clonedNode.onload = resolve;
      clonedNode.onerror = options.onImageErrorHandler ? (...attributes) => {
        try {
          resolve(options.onImageErrorHandler(...attributes));
        } catch (error) {
          reject(error);
        }
      } : reject;
      const image = clonedNode;
      if (image.decode) {
        image.decode = resolve;
      }
      if (image.loading === "lazy") {
        image.loading = "eager";
      }
      if (isImageElement) {
        clonedNode.srcset = "";
        clonedNode.src = dataURL;
      } else {
        clonedNode.href.baseVal = dataURL;
      }
    });
  }
  async function embedChildren(clonedNode, options) {
    const children = toArray(clonedNode.childNodes);
    const deferreds = children.map((child) => embedImages(child, options));
    await Promise.all(deferreds).then(() => clonedNode);
  }
  async function embedImages(clonedNode, options) {
    if (isInstanceOfElement(clonedNode, Element)) {
      await embedBackground(clonedNode, options);
      await embedImageNode(clonedNode, options);
      await embedChildren(clonedNode, options);
    }
  }

  // node_modules/html-to-image/es/apply-style.js
  function applyStyle(node, options) {
    const { style } = node;
    if (options.backgroundColor) {
      style.backgroundColor = options.backgroundColor;
    }
    if (options.width) {
      style.width = `${options.width}px`;
    }
    if (options.height) {
      style.height = `${options.height}px`;
    }
    const manual = options.style;
    if (manual != null) {
      Object.keys(manual).forEach((key) => {
        style[key] = manual[key];
      });
    }
    return node;
  }

  // node_modules/html-to-image/es/embed-webfonts.js
  var cssFetchCache = {};
  async function fetchCSS(url) {
    let cache2 = cssFetchCache[url];
    if (cache2 != null) {
      return cache2;
    }
    const res = await fetch(url);
    const cssText = await res.text();
    cache2 = { url, cssText };
    cssFetchCache[url] = cache2;
    return cache2;
  }
  async function embedFonts(data, options) {
    let cssText = data.cssText;
    const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
    const fontLocs = cssText.match(/url\([^)]+\)/g) || [];
    const loadFonts = fontLocs.map(async (loc) => {
      let url = loc.replace(regexUrl, "$1");
      if (!url.startsWith("https://")) {
        url = new URL(url, data.url).href;
      }
      return fetchAsDataURL(url, options.fetchRequestInit, ({ result }) => {
        cssText = cssText.replace(loc, `url(${result})`);
        return [loc, result];
      });
    });
    return Promise.all(loadFonts).then(() => cssText);
  }
  function parseCSS(source) {
    if (source == null) {
      return [];
    }
    const result = [];
    const commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
    let cssText = source.replace(commentsRegex, "");
    const keyframesRegex = new RegExp("((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})", "gi");
    while (true) {
      const matches = keyframesRegex.exec(cssText);
      if (matches === null) {
        break;
      }
      result.push(matches[0]);
    }
    cssText = cssText.replace(keyframesRegex, "");
    const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
    const combinedCSSRegex = "((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})";
    const unifiedRegex = new RegExp(combinedCSSRegex, "gi");
    while (true) {
      let matches = importRegex.exec(cssText);
      if (matches === null) {
        matches = unifiedRegex.exec(cssText);
        if (matches === null) {
          break;
        } else {
          importRegex.lastIndex = unifiedRegex.lastIndex;
        }
      } else {
        unifiedRegex.lastIndex = importRegex.lastIndex;
      }
      result.push(matches[0]);
    }
    return result;
  }
  async function getCSSRules(styleSheets, options) {
    const ret = [];
    const deferreds = [];
    styleSheets.forEach((sheet) => {
      if ("cssRules" in sheet) {
        try {
          toArray(sheet.cssRules || []).forEach((item, index) => {
            if (item.type === CSSRule.IMPORT_RULE) {
              let importIndex = index + 1;
              const url = item.href;
              const deferred = fetchCSS(url).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
                try {
                  sheet.insertRule(rule, rule.startsWith("@import") ? importIndex += 1 : sheet.cssRules.length);
                } catch (error) {
                  console.error("Error inserting rule from remote css", {
                    rule,
                    error
                  });
                }
              })).catch((e) => {
                console.error("Error loading remote css", e.toString());
              });
              deferreds.push(deferred);
            }
          });
        } catch (e) {
          const inline = styleSheets.find((a) => a.href == null) || document.styleSheets[0];
          if (sheet.href != null) {
            deferreds.push(fetchCSS(sheet.href).then((metadata) => embedFonts(metadata, options)).then((cssText) => parseCSS(cssText).forEach((rule) => {
              inline.insertRule(rule, inline.cssRules.length);
            })).catch((err) => {
              console.error("Error loading remote stylesheet", err);
            }));
          }
          console.error("Error inlining remote css file", e);
        }
      }
    });
    return Promise.all(deferreds).then(() => {
      styleSheets.forEach((sheet) => {
        if ("cssRules" in sheet) {
          try {
            toArray(sheet.cssRules || []).forEach((item) => {
              ret.push(item);
            });
          } catch (e) {
            console.error(`Error while reading CSS rules from ${sheet.href}`, e);
          }
        }
      });
      return ret;
    });
  }
  function getWebFontRules(cssRules) {
    return cssRules.filter((rule) => rule.type === CSSRule.FONT_FACE_RULE).filter((rule) => shouldEmbed(rule.style.getPropertyValue("src")));
  }
  async function parseWebFontRules(node, options) {
    if (node.ownerDocument == null) {
      throw new Error("Provided element is not within a Document");
    }
    const styleSheets = toArray(node.ownerDocument.styleSheets);
    const cssRules = await getCSSRules(styleSheets, options);
    return getWebFontRules(cssRules);
  }
  function normalizeFontFamily(font) {
    return font.trim().replace(/["']/g, "");
  }
  function getUsedFonts(node) {
    const fonts = /* @__PURE__ */ new Set();
    function traverse(node2) {
      const fontFamily = node2.style.fontFamily || getComputedStyle(node2).fontFamily;
      fontFamily.split(",").forEach((font) => {
        fonts.add(normalizeFontFamily(font));
      });
      Array.from(node2.children).forEach((child) => {
        if (child instanceof HTMLElement) {
          traverse(child);
        }
      });
    }
    traverse(node);
    return fonts;
  }
  async function getWebFontCSS(node, options) {
    const rules = await parseWebFontRules(node, options);
    const usedFonts = getUsedFonts(node);
    const cssTexts = await Promise.all(rules.filter((rule) => usedFonts.has(normalizeFontFamily(rule.style.fontFamily))).map((rule) => {
      const baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
      return embedResources(rule.cssText, baseUrl, options);
    }));
    return cssTexts.join("\n");
  }
  async function embedWebFonts(clonedNode, options) {
    const cssText = options.fontEmbedCSS != null ? options.fontEmbedCSS : options.skipFonts ? null : await getWebFontCSS(clonedNode, options);
    if (cssText) {
      const styleNode = document.createElement("style");
      const sytleContent = document.createTextNode(cssText);
      styleNode.appendChild(sytleContent);
      if (clonedNode.firstChild) {
        clonedNode.insertBefore(styleNode, clonedNode.firstChild);
      } else {
        clonedNode.appendChild(styleNode);
      }
    }
  }

  // node_modules/html-to-image/es/index.js
  async function toSvg(node, options = {}) {
    const { width, height } = getImageSize(node, options);
    const clonedNode = await cloneNode(node, options, true);
    await embedWebFonts(clonedNode, options);
    await embedImages(clonedNode, options);
    applyStyle(clonedNode, options);
    const datauri = await nodeToDataURL(clonedNode, width, height);
    return datauri;
  }
  async function toCanvas(node, options = {}) {
    const { width, height } = getImageSize(node, options);
    const svg = await toSvg(node, options);
    const img = await createImage(svg);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const ratio = options.pixelRatio || getPixelRatio();
    const canvasWidth = options.canvasWidth || width;
    const canvasHeight = options.canvasHeight || height;
    canvas.width = canvasWidth * ratio;
    canvas.height = canvasHeight * ratio;
    if (!options.skipAutoScale) {
      checkCanvasDimensions(canvas);
    }
    canvas.style.width = `${canvasWidth}`;
    canvas.style.height = `${canvasHeight}`;
    if (options.backgroundColor) {
      context.fillStyle = options.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  }
  async function toPng(node, options = {}) {
    const canvas = await toCanvas(node, options);
    return canvas.toDataURL();
  }

  // src/clipboard.ts
  function browserClipboard() {
    const clipboard = navigator.clipboard;
    return clipboard && typeof clipboard.write === "function" ? clipboard : null;
  }
  function clipboardItemConstructor() {
    const constructor = globalThis.ClipboardItem;
    return typeof constructor === "function" ? constructor : null;
  }
  async function copyPng(dataUrl, writer) {
    try {
      await writer.write(dataUrl);
      return { status: "copied" };
    } catch (error) {
      return {
        status: "failed",
        reason: error instanceof Error && error.message ? error.message : "\u6D4F\u89C8\u5668\u62D2\u7EDD\u5199\u5165\u56FE\u7247\u526A\u8D34\u677F"
      };
    }
  }
  function describePosterCopyResult(outcome) {
    if (outcome.status === "copied") {
      return {
        statusMessage: "\u6D77\u62A5\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\u3002",
        helpMessage: "\u4EC5\u590D\u5236\u4E86\u6D77\u62A5\u56FE\u7247\uFF0C\u4E0D\u5305\u542B\u5206\u4EAB\u6587\u6848\u3002",
        downloadGuidance: false
      };
    }
    return {
      statusMessage: "\u6D77\u62A5\u590D\u5236\u5931\u8D25\u3002",
      helpMessage: `${outcome.reason} \u8BF7\u6539\u7528\u201C\u4E0B\u8F7D PNG\u201D\u4FDD\u5B58\u56FE\u7247\u3002`,
      downloadGuidance: true
    };
  }
  async function copyText(text, writer) {
    try {
      await writer.write(text);
      return { status: "copied" };
    } catch (error) {
      return {
        status: "failed",
        reason: error instanceof Error && error.message ? error.message : "\u6D4F\u89C8\u5668\u62D2\u7EDD\u5199\u5165\u6587\u672C\u526A\u8D34\u677F"
      };
    }
  }
  function describeTextCopyResult(outcome) {
    if (outcome.status === "copied") {
      return {
        statusMessage: "\u6587\u6848\u5DF2\u590D\u5236\u3002",
        helpMessage: "\u4EC5\u590D\u5236\u4E86\u5206\u4EAB\u6587\u6848\uFF0C\u4E0D\u5305\u542B\u6D77\u62A5\u56FE\u7247\u3002",
        manualCopy: false
      };
    }
    return {
      statusMessage: "\u6587\u6848\u590D\u5236\u5931\u8D25\u3002",
      helpMessage: `${outcome.reason} \u6587\u6848\u4ECD\u5728\u4E0A\u65B9\uFF0C\u53EF\u624B\u52A8\u5168\u9009\u590D\u5236\u3002`,
      manualCopy: true
    };
  }
  async function copyShareTextToClipboard(text) {
    const clipboard = browserClipboard();
    if (clipboard && typeof clipboard.writeText === "function") {
      return copyText(text, {
        async write(value) {
          await clipboard.writeText(value);
        }
      });
    }
    if (typeof GM_setClipboard === "function") {
      return copyText(text, {
        async write(value) {
          GM_setClipboard(value, "text");
        }
      });
    }
    return { status: "failed", reason: "\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u6587\u672C\u526A\u8D34\u677F\u5199\u5165" };
  }
  function escapeHtml(value) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
  function buildCombinedHtml(posterDataUrl, shareText) {
    return `<img src="${escapeHtml(posterDataUrl)}" alt="\u5206\u4EAB\u6D77\u62A5"><br><pre>${escapeHtml(shareText)}</pre>`;
  }
  async function copyCombined(posterDataUrl, shareText, ports) {
    const html = buildCombinedHtml(posterDataUrl, shareText);
    try {
      await ports.writeCombined(posterDataUrl, shareText, html);
      return { status: "copied" };
    } catch (combinedError) {
      const combinedReason = combinedError instanceof Error && combinedError.message ? combinedError.message : "\u7EC4\u5408\u5199\u5165\u5931\u8D25";
      try {
        await ports.writeText(shareText);
        return { status: "text-fallback", reason: combinedReason };
      } catch (textError) {
        return {
          status: "failed",
          reason: textError instanceof Error && textError.message ? textError.message : "\u6587\u6848\u5199\u5165\u5931\u8D25"
        };
      }
    }
  }
  function describeCombinedCopyResult(outcome) {
    if (outcome.status === "copied") {
      return {
        statusMessage: "\u5DF2\u5199\u5165\u517C\u5BB9\u683C\u5F0F\u3002",
        helpMessage: "\u63A5\u6536\u65B9\u53EF\u80FD\u53EA\u53D6\u5176\u4E2D\u4E00\u79CD\uFF1B\u4E0D\u4FDD\u8BC1\u7C98\u8D34\u65F6\u56FE\u4E0E\u6587\u540C\u65F6\u51FA\u73B0\u3002"
      };
    }
    if (outcome.status === "text-fallback") {
      return {
        statusMessage: "\u7EC4\u5408\u590D\u5236\u5931\u8D25\uFF0C\u5DF2\u6539\u4E3A\u4EC5\u590D\u5236\u6587\u6848\u3002",
        helpMessage: `${outcome.reason} \u6D77\u62A5\u4ECD\u9700\u5355\u72EC\u590D\u5236\u6216\u4E0B\u8F7D PNG\u3002`
      };
    }
    return {
      statusMessage: "\u7EC4\u5408\u590D\u5236\u5931\u8D25\u3002",
      helpMessage: `${outcome.reason} \u6587\u6848\u4ECD\u5728\u4E0A\u65B9\uFF0C\u53EF\u624B\u52A8\u5168\u9009\u590D\u5236\uFF1B\u6D77\u62A5\u8BF7\u4F7F\u7528\u201C\u590D\u5236\u6D77\u62A5\u201D\u6216\u201C\u4E0B\u8F7D PNG\u201D\u3002`
    };
  }
  async function copyCombinedPosterAndText(posterDataUrl, shareText) {
    const clipboardItemCtor = clipboardItemConstructor();
    const clipboard = browserClipboard();
    if (clipboardItemCtor && clipboard) {
      const textBlob = new Blob([shareText], { type: "text/plain" });
      const htmlBlob = new Blob([buildCombinedHtml(posterDataUrl, shareText)], { type: "text/html" });
      const ports = {
        async writeCombined(dataUrl, _text, _html) {
          await clipboard.write([
            new clipboardItemCtor({
              "image/png": pngDataUrlToBlob(dataUrl),
              "text/plain": textBlob,
              "text/html": htmlBlob
            })
          ]);
        },
        writeText: (text) => copyShareTextToClipboard(text).then((outcome) => {
          if (outcome.status === "failed") throw new Error(outcome.reason);
        })
      };
      return copyCombined(posterDataUrl, shareText, ports);
    }
    const textOutcome = await copyShareTextToClipboard(shareText);
    return textOutcome.status === "copied" ? { status: "text-fallback", reason: "\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u7EC4\u5408\u526A\u8D34\u677F\u5199\u5165" } : { status: "failed", reason: textOutcome.reason };
  }
  function pngDataUrlToBlob(dataUrl) {
    const [header, base64] = dataUrl.split(",");
    if (!header?.startsWith("data:image/png") || !base64) throw new Error("\u6D77\u62A5 PNG \u6570\u636E\u65E0\u6548");
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: "image/png" });
  }
  async function copyPosterPngToClipboard(dataUrl) {
    const clipboardItemCtor = clipboardItemConstructor();
    const clipboard = browserClipboard();
    if (!clipboardItemCtor || !clipboard) {
      return { status: "failed", reason: "\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u56FE\u7247\u526A\u8D34\u677F\u5199\u5165" };
    }
    return copyPng(dataUrl, {
      async write(value) {
        await clipboard.write([new clipboardItemCtor({ "image/png": pngDataUrlToBlob(value) })]);
      }
    });
  }

  // src/domain.ts
  function posterTitleFontSize(theme, title) {
    if (theme === "A") return 19;
    const length = Array.from(title).length;
    if (length <= 20) return 19;
    if (length <= 32) return 17;
    return 15;
  }
  function formatCompactStat(value) {
    if (value === null || !Number.isFinite(value)) return "--";
    if (value >= 1e8) return `${(value / 1e8).toFixed(1)}\u4EBF`;
    if (value >= 1e4) return `${(value / 1e4).toFixed(1)}\u4E07`;
    return Math.max(0, Math.trunc(value)).toString();
  }
  function formatTimestamp(seconds) {
    const wholeSeconds = Math.max(0, Math.floor(seconds));
    const hours = Math.floor(wholeSeconds / 3600);
    const minutes = Math.floor(wholeSeconds % 3600 / 60);
    const remainder = wholeSeconds % 60;
    const mm = minutes.toString().padStart(2, "0");
    const ss = remainder.toString().padStart(2, "0");
    return hours > 0 ? `${hours.toString().padStart(2, "0")}:${mm}:${ss}` : `${mm}:${ss}`;
  }
  function buildPosterFilename(bvid, generatedAt, partNumber) {
    const twoDigits = (value) => value.toString().padStart(2, "0");
    const stamp = `${generatedAt.getFullYear()}${twoDigits(generatedAt.getMonth() + 1)}${twoDigits(generatedAt.getDate())}-${twoDigits(generatedAt.getHours())}${twoDigits(generatedAt.getMinutes())}${twoDigits(generatedAt.getSeconds())}`;
    const partSegment = partNumber && partNumber > 0 ? `_P${partNumber}` : "";
    return `bilibili_${bvid}${partSegment}_${stamp}.png`;
  }
  function buildPartLabel(snapshot, options) {
    if (!options.partShare) return null;
    const title = snapshot.partTitle?.trim() ? snapshot.partTitle.trim() : "";
    return title ? `P${snapshot.partNumber} \xB7 ${title}` : `P${snapshot.partNumber}`;
  }
  function buildTimestampLabel(snapshot, options) {
    return options.timestampShare && Math.floor(snapshot.playbackSeconds) >= 1 ? formatTimestamp(snapshot.playbackSeconds) : null;
  }
  function requireText(value, label) {
    const normalized = value.trim();
    if (!normalized) throw new Error(`\u7F3A\u5C11${label}`);
    return normalized;
  }
  function validateShareTarget(shareTarget, bvid) {
    let url;
    try {
      url = new URL(shareTarget);
    } catch {
      throw new Error("\u5206\u4EAB\u94FE\u63A5\u65E0\u6548");
    }
    const canonicalIdentity = parseCanonicalVideoIdentity(url.toString());
    const isCanonical = canonicalIdentity?.bvid.toUpperCase() === bvid.toUpperCase();
    const isOpaqueShort = isOpaqueShortUrl(url);
    if (url.protocol !== "https:" || !isCanonical && !isOpaqueShort) {
      throw new Error("\u5206\u4EAB\u94FE\u63A5\u65E0\u6548");
    }
    return url.toString();
  }
  function buildSharePoster(snapshot, shareTarget, options) {
    const title = requireText(snapshot.title, "\u89C6\u9891\u6807\u9898");
    const coverDataUrl = snapshot.coverUnavailable ? "" : requireText(snapshot.coverDataUrl, "\u89C6\u9891\u5C01\u9762");
    const uploader = requireText(snapshot.uploader, "UP \u4E3B");
    const bvid = requireText(snapshot.bvid, "BV \u6807\u8BC6");
    if (!Number.isSafeInteger(snapshot.aid) || snapshot.aid <= 0) throw new Error("\u7F3A\u5C11AV \u6807\u8BC6");
    const validatedShareTarget = validateShareTarget(shareTarget, bvid);
    const theme = options.theme === "B" ? "B" : "A";
    const titleLines = theme === "A" ? 2 : 3;
    const contentOrder = theme === "A" ? ["cover", "title", "uploader-identity", "part-timestamp", "stats", "destination"] : ["cover", "part-timestamp", "title", "uploader-identity", "stats", "destination"];
    return {
      theme,
      dimensions: { width: 1080, height: 1440 },
      coverDataUrl,
      coverUnavailable: snapshot.coverUnavailable,
      title,
      uploader,
      identity: `${bvid} \xB7 AV${snapshot.aid}`,
      shareTarget: validatedShareTarget,
      titleLines,
      titleFontSize: posterTitleFontSize(theme, title),
      linkWrap: "anywhere",
      contentOrder,
      partLabel: buildPartLabel(snapshot, options),
      timestampLabel: buildTimestampLabel(snapshot, options),
      stats: [
        { label: "\u64AD\u653E", value: formatCompactStat(snapshot.stats.views) },
        { label: "\u70B9\u8D5E", value: formatCompactStat(snapshot.stats.likes) },
        { label: "\u6295\u5E01", value: formatCompactStat(snapshot.stats.coins) },
        { label: "\u6536\u85CF", value: formatCompactStat(snapshot.stats.favorites) }
      ]
    };
  }

  // src/share-text.ts
  function buildCompactShareText(title, uploader, shareTarget) {
    return `${title}\uFF08UP\u4E3B\uFF1A${uploader}\uFF09
${shareTarget}`;
  }
  function formatExactStat(value) {
    if (value === null || !Number.isFinite(value)) return "--";
    const whole = Math.max(0, Math.trunc(value));
    return whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function plainDetailedText(snapshot, shareTarget, options) {
    const lines = [
      snapshot.title,
      `UP\u4E3B\uFF1A${snapshot.uploader}`,
      `BV/AV\uFF1A${snapshot.bvid} \xB7 AV${snapshot.aid}`,
      `\u64AD\u653E\uFF1A${formatExactStat(snapshot.stats.views)}\u3000\u70B9\u8D5E\uFF1A${formatExactStat(snapshot.stats.likes)}\u3000\u6295\u5E01\uFF1A${formatExactStat(snapshot.stats.coins)}\u3000\u6536\u85CF\uFF1A${formatExactStat(snapshot.stats.favorites)}`
    ];
    const partLabel = buildPartLabel(snapshot, options);
    if (partLabel) lines.push(`\u5206P\uFF1A${partLabel}`);
    if (options.timestampShare && Math.floor(snapshot.playbackSeconds) >= 1) {
      lines.push(`\u65F6\u95F4\uFF1A${formatTimestamp(snapshot.playbackSeconds)}`);
    }
    lines.push(shareTarget);
    return lines.join("\n");
  }
  function markdownDetailedText(snapshot, shareTarget, options) {
    const lines = [
      `**${snapshot.title}**`,
      "",
      `- UP\u4E3B\uFF1A${snapshot.uploader}`,
      `- BV/AV\uFF1A${snapshot.bvid} \xB7 AV${snapshot.aid}`,
      `- \u64AD\u653E\uFF1A${formatExactStat(snapshot.stats.views)} \xB7 \u70B9\u8D5E\uFF1A${formatExactStat(snapshot.stats.likes)} \xB7 \u6295\u5E01\uFF1A${formatExactStat(snapshot.stats.coins)} \xB7 \u6536\u85CF\uFF1A${formatExactStat(snapshot.stats.favorites)}`
    ];
    const partLabel = buildPartLabel(snapshot, options);
    if (partLabel) lines.push(`- \u5206P\uFF1A${partLabel}`);
    if (options.timestampShare && Math.floor(snapshot.playbackSeconds) >= 1) {
      lines.push(`- \u65F6\u95F4\uFF1A${formatTimestamp(snapshot.playbackSeconds)}`);
    }
    lines.push(`- \u94FE\u63A5\uFF1A${shareTarget}`);
    return lines.join("\n");
  }
  function buildShareText(snapshot, shareTarget, options) {
    if (options.detailedText) {
      return options.markdownText ? markdownDetailedText(snapshot, shareTarget, options) : plainDetailedText(snapshot, shareTarget, options);
    }
    if (options.markdownText) {
      return `[${snapshot.title}](${shareTarget})
${shareTarget}`;
    }
    return buildCompactShareText(snapshot.title, snapshot.uploader, shareTarget);
  }

  // src/ui/dom.ts
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== void 0) node.textContent = text;
    return node;
  }

  // src/ui/posters.ts
  var import_qrcode = __toESM(require_browser(), 1);
  function posterQrDataUrl(shareTarget) {
    return import_qrcode.default.toDataURL(shareTarget, { width: 234, margin: 4, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
  }
  async function createPoster(model) {
    if (model.theme === "B") return createPosterB(model);
    const poster = element("article", "bsp-poster");
    poster.setAttribute("aria-label", `${model.title} \u5206\u4EAB\u6D77\u62A5`);
    const masthead = element("header", "bsp-masthead");
    masthead.append(element("strong", "", "BILIBILI \u5206\u4EAB\u6D77\u62A5"), element("span", "", "SHARE CARD"));
    const cover = model.coverUnavailable ? element("div", "bsp-cover bsp-cover-missing", "COVER UNAVAILABLE") : Object.assign(element("img", "bsp-cover"), { src: model.coverDataUrl, alt: "" });
    const title = element("h4", "bsp-poster-title", model.title);
    title.style.setProperty("-webkit-line-clamp", model.titleLines.toString());
    const byline = element("div", "bsp-byline");
    byline.append(element("strong", "", `UP \u4E3B \xB7 ${model.uploader}`), element("span", "bsp-identity", model.identity));
    const partTimestamp = element("div", "bsp-part-timestamp");
    if (model.partLabel) partTimestamp.append(element("span", "bsp-part-chip", model.partLabel));
    if (model.timestampLabel) partTimestamp.append(element("span", "bsp-time-chip", model.timestampLabel));
    const stats = element("div", "bsp-stats");
    for (const statistic2 of model.stats) {
      const cell = element("div", "bsp-stat");
      cell.append(element("strong", "", statistic2.value), element("span", "", statistic2.label));
      stats.append(cell);
    }
    const destination = element("div", "bsp-destination");
    const qr = element("img", "bsp-qr");
    qr.alt = `\u4E8C\u7EF4\u7801\uFF1A${model.shareTarget}`;
    qr.src = await posterQrDataUrl(model.shareTarget);
    const linkArea = element("div");
    const visibleLink = element("span", "bsp-link", model.shareTarget);
    visibleLink.style.overflowWrap = model.linkWrap;
    linkArea.append(element("span", "bsp-link-label", "\u626B\u7801\u89C2\u770B \xB7 SHARE TARGET"), visibleLink);
    destination.append(qr, linkArea);
    poster.classList.add(`bsp-theme-${model.theme.toLowerCase()}`);
    poster.append(masthead);
    const content = {
      cover,
      title,
      "uploader-identity": byline,
      "part-timestamp": partTimestamp,
      stats,
      destination
    };
    for (const section of model.contentOrder) poster.append(content[section]);
    poster.append(element("span", "bsp-archive", `ARCHIVE \xB7 ${model.identity}`));
    return poster;
  }
  async function createPosterB(model) {
    const poster = element("article", "bsp-poster bsp-poster-b");
    poster.setAttribute("aria-label", `${model.title} \u5206\u4EAB\u6D77\u62A5`);
    if (model.coverUnavailable) {
      poster.classList.add("bsp-cover-missing");
      poster.append(element("div", "bsp-b-cover-missing", "COVER UNAVAILABLE"));
    } else {
      const cover = Object.assign(element("img", "bsp-cover-b"), { src: model.coverDataUrl, alt: "" });
      poster.append(cover);
    }
    const scrim = element("div", "bsp-b-scrim");
    const content = element("div", "bsp-b-content");
    content.append(scrim);
    const topLine = element("div", "bsp-b-topline");
    if (model.partLabel) topLine.append(element("span", "bsp-b-part-chip", model.partLabel));
    if (model.timestampLabel) topLine.append(element("span", "bsp-b-time-chip", model.timestampLabel));
    content.append(topLine);
    const bottom = element("div", "bsp-b-bottom");
    const title = element("h4", "bsp-b-title", model.title);
    title.style.setProperty("-webkit-line-clamp", model.titleLines.toString());
    title.style.fontSize = `${model.titleFontSize}px`;
    bottom.append(title, element("div", "bsp-b-up", `UP \u4E3B \xB7 ${model.uploader}`));
    const stats = element("div", "bsp-b-stats");
    for (const statistic2 of model.stats) {
      const cell = element("div", "bsp-b-stat");
      cell.append(element("strong", "", statistic2.value), element("span", "", statistic2.label));
      stats.append(cell);
    }
    bottom.append(stats, element("div", "bsp-b-identity", model.identity));
    const destination = element("div", "bsp-b-destination");
    const qr = element("img", "bsp-b-qr");
    qr.alt = `\u4E8C\u7EF4\u7801\uFF1A${model.shareTarget}`;
    qr.src = await posterQrDataUrl(model.shareTarget);
    const linkSide = element("div", "bsp-b-link-side");
    const visibleLink = element("span", "bsp-b-link", model.shareTarget);
    visibleLink.style.overflowWrap = model.linkWrap;
    linkSide.append(element("span", "bsp-b-link-label", "\u626B\u7801\u89C2\u770B \xB7 SHARE TARGET"), visibleLink);
    destination.append(qr, linkSide);
    bottom.append(destination);
    content.append(bottom);
    poster.append(content);
    return poster;
  }

  // src/ui/panel.ts
  var SharePanel = class {
    backdrop = element("div", "bsp-backdrop");
    panel = element("section", "bsp-panel");
    previewPane = element("div", "bsp-preview-pane");
    controls = element("div", "bsp-controls");
    capture = null;
    snapshot = null;
    model = null;
    poster = null;
    options = createDefaultShareOptions();
    targetSelection = null;
    closed = false;
    loading = false;
    updating = false;
    exportButtons = [];
    statusTimer = 0;
    onClosed;
    constructor(onClosed) {
      this.onClosed = onClosed;
      this.backdrop.setAttribute("role", "presentation");
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-modal", "true");
      this.panel.setAttribute("aria-labelledby", "bsp-dialog-title");
      this.panel.tabIndex = -1;
      const heading = element("header", "bsp-panel-head");
      const eyebrow = element("span", "bsp-eyebrow", "BILIBILI SHARE");
      eyebrow.id = "bsp-dialog-title";
      const close = element("button", "bsp-close", "\xD7");
      close.type = "button";
      close.setAttribute("aria-label", "\u5173\u95ED\u5206\u4EAB\u9762\u677F");
      close.addEventListener("click", () => this.close(true));
      heading.append(eyebrow, close);
      const workspace = element("div", "bsp-workspace");
      workspace.append(this.previewPane, this.controls);
      this.panel.append(heading, workspace);
      this.backdrop.append(this.panel);
      this.backdrop.addEventListener("click", (event) => {
        if (event.target === this.backdrop) this.close(true);
      });
      this.onKeyDown = this.onKeyDown.bind(this);
    }
    open() {
      this.options = createPanelShareOptions(loadRememberedPreferences());
      document.body.append(this.backdrop);
      document.addEventListener("keydown", this.onKeyDown, true);
      this.renderLoading();
      this.panel.focus();
      void this.captureThenLoad();
    }
    focus() {
      this.panel.focus();
    }
    matchesCurrentPage() {
      if (!this.capture) return true;
      const current = readPageIdentity();
      return Boolean(current && current.bvid.toUpperCase() === this.capture.bvid.toUpperCase() && current.partNumber === this.capture.partNumber);
    }
    close(restore) {
      if (this.closed) return;
      this.closed = true;
      document.removeEventListener("keydown", this.onKeyDown, true);
      this.backdrop.classList.add("bsp-backdrop-closing");
      this.panel.classList.add("bsp-panel-closing");
      window.setTimeout(() => {
        this.backdrop.remove();
        if (restore && this.capture) restorePlayback(this.capture);
        this.onClosed();
      }, 170);
    }
    onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close(true);
      }
    }
    renderLoading() {
      this.previewPane.replaceChildren();
      const loading = element("div", "bsp-loading-card");
      const message = element("div");
      message.append(element("div", "bsp-spinner"), element("div", "", "\u6B63\u5728\u6355\u83B7\u89C6\u9891\u4FE1\u606F\u2026"));
      loading.append(message);
      this.previewPane.append(loading);
      this.controls.replaceChildren(
        element("p", "bsp-step", "01 / GENERATION SNAPSHOT"),
        element("h3", "", "\u6B63\u5728\u5EFA\u7ACB\u7A33\u5B9A\u5FEB\u7167"),
        element("p", "", "\u64AD\u653E\u5668\u6682\u505C\u540E\uFF0C\u89C6\u9891\u8EAB\u4EFD\u3001\u64AD\u653E\u4F4D\u7F6E\u4E0E\u516C\u5F00\u7EDF\u8BA1\u4F1A\u56FA\u5B9A\u5728\u8FD9\u4E00\u6B21\u751F\u6210\u4E2D\u3002")
      );
    }
    async captureThenLoad() {
      try {
        this.capture = captureAndPausePlayback();
      } catch (error) {
        this.renderError(error, true);
        return;
      }
      await this.loadSnapshot();
    }
    async loadSnapshot() {
      if (!this.capture || this.loading) return;
      this.loading = true;
      try {
        const { snapshot, targetSelection } = await fetchGenerationResources(this.capture);
        const model = buildSharePoster(snapshot, targetSelection.shareTarget, this.options);
        const poster = await createPoster(model);
        if (this.closed) return;
        this.snapshot = snapshot;
        this.model = model;
        this.poster = poster;
        this.targetSelection = targetSelection;
        this.renderReady(model, poster, targetSelection);
      } catch (error) {
        if (!this.closed) this.renderError(error, false);
      } finally {
        this.loading = false;
      }
    }
    renderReady(model, poster, targetSelection) {
      const frame = element("div", "bsp-preview-frame");
      frame.append(poster);
      this.previewPane.replaceChildren(frame);
      this.applyThemeClasses(model.theme);
      this.updating = false;
      this.exportButtons = [];
      if (!this.snapshot) return;
      const snapshot = this.snapshot;
      const shareText = buildShareText(snapshot, model.shareTarget, this.options);
      const textPreview = this.renderTextPreview(shareText);
      const actions = element("div", "bsp-actions");
      const status = element("p", "bsp-status");
      status.setAttribute("role", "status");
      const copy = this.actionButton("copy", "\u590D\u5236\u6D77\u62A5", "\u590D\u5236\u6D77\u62A5", true, () => void this.copyPoster(copy, status));
      const download = this.actionButton("download", "\u4E0B\u8F7D PNG", "\u4E0B\u8F7D PNG", false, () => void this.download(download, status));
      const copyTextButton = this.actionButton("copy-text", "\u590D\u5236\u6587\u6848", "\u590D\u5236\u6587\u6848", false, () => void this.copyShareText(copyTextButton, shareText, status));
      const combinedButton = this.actionButton("combined", "\u7EC4\u5408\u590D\u5236", "\u7EC4\u5408\u590D\u5236", false, () => void this.copyCombined(combinedButton, shareText, status));
      actions.append(copy, download, copyTextButton, combinedButton, status);
      this.exportButtons.push(copy, download, copyTextButton, combinedButton);
      const content = [this.renderThemePicker(), this.renderShareOptions()];
      if (targetSelection.source === "canonical-fallback") {
        const fallback = element("div", "bsp-fallback");
        fallback.setAttribute("role", "status");
        fallback.append(
          element("strong", "", "\u77ED\u94FE\u4E0D\u53EF\u7528\uFF0C\u5DF2\u4F7F\u7528\u89C4\u8303\u957F\u94FE\u63A5"),
          element("span", "", `\u539F\u56E0\uFF1A${targetSelection.fallbackReason ?? "\u77ED\u94FE\u672A\u901A\u8FC7\u6821\u9A8C"}\u3002\u4E0D\u4F1A\u5F71\u54CD\u9884\u89C8\u6216\u4E0B\u8F7D\u3002`)
        );
        content.push(fallback);
      }
      content.push(textPreview, actions);
      this.controls.replaceChildren(...content);
    }
    renderTextPreview(shareText) {
      const lines = shareText.split("\n");
      const link = lines.pop() ?? "";
      const body = lines.join("\n");
      const card = element("div", "bsp-text-card");
      card.setAttribute("aria-label", "\u5206\u4EAB\u6587\u6848\u9884\u89C8");
      card.append(element("span", "bsp-text-card-body", body), element("span", "bsp-text-card-link", link));
      return card;
    }
    actionButton(iconName, label, tip, primary, onClick) {
      const button = element("button", primary ? "bsp-action bsp-action-primary" : "bsp-action", label);
      button.type = "button";
      button.dataset.tip = tip;
      button.setAttribute("aria-label", tip);
      button.prepend(createIcon(iconName));
      button.addEventListener("click", onClick);
      return button;
    }
    showStatus(message, error = false) {
      const status = this.controls.querySelector(".bsp-status");
      if (!status) return;
      clearTimeout(this.statusTimer);
      status.textContent = message;
      status.classList.toggle("is-error", error);
      status.classList.add("is-show");
      this.statusTimer = window.setTimeout(() => status.classList.remove("is-show"), error ? 0 : 3e3);
    }
    optionToggle(iconName, labelText, checked, disabled, onChange) {
      const button = element("button", "bsp-option-pill", labelText);
      button.type = "button";
      button.disabled = disabled;
      button.setAttribute("aria-pressed", String(checked));
      button.classList.toggle("is-on", checked);
      button.addEventListener("click", () => onChange(button.getAttribute("aria-pressed") !== "true"));
      button.prepend(createIcon(iconName));
      return button;
    }
    renderShareOptions() {
      const container = element("div", "bsp-options");
      const snapshot = this.snapshot;
      if (!snapshot) return container;
      container.append(
        this.optionToggle("list", "\u5206P", this.options.partShare, !canEnablePartShare(snapshot) || this.updating, (checked) => {
          void checked;
          this.applyOptions(togglePartShare(this.options, snapshot));
        }),
        this.optionToggle("clock", "\u65F6\u95F4\u6233", this.options.timestampShare, !canEnableTimestampShare(snapshot) || this.updating, (checked) => {
          void checked;
          this.applyOptions(toggleTimestampShare(this.options, snapshot));
        }),
        this.optionToggle("detail", "\u8BE6\u7EC6", this.options.detailedText, this.updating, (checked) => {
          this.applyOptions({ ...this.options, detailedText: checked });
        }),
        this.optionToggle("markdown", "Markdown", this.options.markdownText, this.updating, (checked) => {
          this.applyOptions({ ...this.options, markdownText: checked });
        })
      );
      if (!snapshot.partIdentified) {
        const notice = element("p", "bsp-option-notice", "\u5F53\u524D\u5206P\u65E0\u6CD5\u8BC6\u522B\uFF0C\u5DF2\u7981\u7528\u5206P\u4E0E\u65F6\u95F4\u6233\u5206\u4EAB\uFF1B\u9ED8\u8BA4\u5206\u4EAB\u4ECD\u53EF\u7528\u3002");
        container.append(notice);
      } else if (Math.floor(snapshot.playbackSeconds) < 1) {
        const notice = element("p", "bsp-option-notice", "\u5F53\u524D\u64AD\u653E\u4F4D\u7F6E\u4E0D\u8DB3 1 \u79D2\uFF0C\u65F6\u95F4\u6233\u5206\u4EAB\u4E0D\u53EF\u7528\u3002");
        container.append(notice);
      }
      return container;
    }
    renderThemePicker() {
      const picker = element("div", "bsp-theme-segment");
      picker.setAttribute("role", "group");
      picker.setAttribute("aria-label", "\u6D77\u62A5\u4E3B\u9898");
      const buttonA = element("button", "bsp-theme-option", "A \u62A5\u520A");
      buttonA.type = "button";
      buttonA.disabled = this.updating;
      buttonA.setAttribute("aria-pressed", String(this.options.theme === "A"));
      buttonA.classList.toggle("is-active", this.options.theme === "A");
      buttonA.addEventListener("click", () => this.applyTheme("A"));
      const buttonB = element("button", "bsp-theme-option", "B \u6C89\u6D78");
      buttonB.type = "button";
      buttonB.disabled = this.updating;
      buttonB.setAttribute("aria-pressed", String(this.options.theme === "B"));
      buttonB.classList.toggle("is-active", this.options.theme === "B");
      buttonB.addEventListener("click", () => this.applyTheme("B"));
      picker.append(buttonA, buttonB);
      return picker;
    }
    applyTheme(theme) {
      if (this.updating || this.options.theme === theme || !this.model || !this.poster || !this.targetSelection) return;
      this.options = { ...this.options, theme };
      this.persistPreferences();
      void this.rebuildPosterForTheme();
    }
    async rebuildPosterForTheme() {
      if (!this.snapshot || !this.targetSelection || this.updating) return;
      this.updating = true;
      this.setExportButtonsDisabled(true);
      try {
        const model = buildSharePoster(this.snapshot, this.targetSelection.shareTarget, this.options);
        const poster = await createPoster(model);
        if (this.closed) return;
        this.model = model;
        this.poster = poster;
        this.applyThemeClasses(model.theme);
        await this.crossfadePoster(poster);
        if (!this.closed) this.renderReady(model, poster, this.targetSelection);
      } catch (error) {
        if (!this.closed) this.renderError(error, false);
      }
    }
    async crossfadePoster(nextPoster) {
      const oldFrame = this.previewPane.querySelector(".bsp-preview-frame");
      const nextFrame = element("div", "bsp-preview-frame bsp-preview-frame-incoming");
      nextFrame.append(nextPoster);
      this.previewPane.append(nextFrame);
      requestAnimationFrame(() => {
        oldFrame?.classList.add("bsp-preview-frame-exit");
        nextFrame.classList.add("is-visible");
      });
      await new Promise((resolve) => setTimeout(resolve, 180));
      oldFrame?.remove();
      nextFrame.classList.remove("bsp-preview-frame-incoming", "is-visible");
    }
    applyThemeClasses(theme) {
      const surface = selectThemeSurfaceClasses(theme);
      this.backdrop.classList.toggle("bsp-theme-b", surface.panel !== null);
      this.panel.classList.toggle("bsp-theme-b", surface.panel !== null);
      setEntryTheme(theme);
    }
    applyOptions(next) {
      if (!this.snapshot || this.updating) return;
      const previous = this.options;
      const targetChanged = previous.partShare !== next.partShare || previous.timestampShare !== next.timestampShare;
      const textChanged = previous.detailedText !== next.detailedText || previous.markdownText !== next.markdownText;
      this.options = next;
      if (textChanged) this.persistPreferences();
      if (targetChanged) {
        void this.rebuildPosterForOptions();
        return;
      }
      if (textChanged && this.model && this.poster && this.targetSelection) {
        this.renderReady(this.model, this.poster, this.targetSelection);
      }
    }
    persistPreferences() {
      if (typeof GM_setValue !== "function") return;
      GM_setValue("bsp-panel-preferences", {
        theme: this.options.theme,
        detailedText: this.options.detailedText,
        markdownText: this.options.markdownText
      });
    }
    async rebuildPosterForOptions() {
      if (!this.snapshot || this.updating) return;
      this.updating = true;
      this.setExportButtonsDisabled(true);
      this.showUpdatingOverlay();
      try {
        const canonicalTarget = buildCanonicalShareTarget(this.snapshot.bvid, this.snapshot, this.options);
        const targetSelection = await fetchValidatedShareTarget(this.snapshot, canonicalTarget);
        const model = buildSharePoster(this.snapshot, targetSelection.shareTarget, this.options);
        const poster = await createPoster(model);
        if (this.closed) return;
        this.model = model;
        this.poster = poster;
        this.targetSelection = targetSelection;
        this.renderReady(model, poster, targetSelection);
      } catch (error) {
        if (!this.closed) this.renderError(error, false);
      }
    }
    setExportButtonsDisabled(disabled) {
      for (const button of this.exportButtons) button.disabled = disabled;
    }
    showUpdatingOverlay() {
      const frame = this.previewPane.querySelector(".bsp-preview-frame");
      if (!frame || frame.querySelector(".bsp-poster-updating")) return;
      frame.append(element("div", "bsp-poster-updating", "\u6B63\u5728\u66F4\u65B0\u2026"));
    }
    renderError(error, retryCapture) {
      const message = error instanceof Error ? error.message : "\u751F\u6210\u6D77\u62A5\u65F6\u53D1\u751F\u672A\u77E5\u9519\u8BEF\u3002";
      this.previewPane.replaceChildren(element("div", "bsp-loading-card", "\u6682\u65F6\u65E0\u6CD5\u751F\u6210\u9884\u89C8"));
      const retry = element("button", "bsp-button", "\u91CD\u8BD5");
      retry.type = "button";
      retry.addEventListener("click", () => {
        this.renderLoading();
        if (retryCapture) void this.captureThenLoad();
        else void this.loadSnapshot();
      });
      this.controls.replaceChildren(
        element("p", "bsp-step", "GENERATION BLOCKED"),
        element("h3", "", "\u6D77\u62A5\u5C1A\u672A\u751F\u6210"),
        element("p", "bsp-error", message),
        retry,
        element("p", "bsp-help", retryCapture ? "\u8BF7\u786E\u8BA4\u4E3B\u64AD\u653E\u5668\u5DF2\u7ECF\u52A0\u8F7D\uFF0C\u518D\u91CD\u8BD5\u3002" : "\u91CD\u8BD5\u4F1A\u4FDD\u7559\u6700\u521D\u6355\u83B7\u7684\u89C6\u9891\u3001\u5206P\u548C\u64AD\u653E\u4F4D\u7F6E\uFF0C\u53EA\u91CD\u65B0\u83B7\u53D6\u751F\u6210\u6240\u9700\u8D44\u6E90\u3002")
      );
    }
    async posterPngDataUrl() {
      if (!this.poster || !this.model) throw new Error("\u6D77\u62A5\u9884\u89C8\u5C1A\u672A\u751F\u6210");
      const sourceWidth = this.poster.offsetWidth;
      const sourceHeight = this.poster.offsetHeight;
      const sourcePixelRatio = this.model.dimensions.width / sourceWidth;
      if (Math.round(sourceHeight * sourcePixelRatio) !== this.model.dimensions.height) throw new Error("\u6D77\u62A5\u753B\u5E03\u6BD4\u4F8B\u4E0D\u4E00\u81F4");
      const backgroundColor = this.model.theme === "B" ? "#000000" : "#f7f5f0";
      return toPng(this.poster, { width: sourceWidth, height: sourceHeight, pixelRatio: sourcePixelRatio, cacheBust: false, backgroundColor });
    }
    async copyPoster(button, status) {
      if (!this.poster || !this.model) return;
      button.disabled = true;
      status.textContent = "";
      try {
        const dataUrl = await this.posterPngDataUrl();
        const outcome = await copyPosterPngToClipboard(dataUrl);
        const feedback = describePosterCopyResult(outcome);
        this.showStatus(
          outcome.status === "copied" ? feedback.statusMessage : `${feedback.statusMessage} ${feedback.helpMessage}`,
          outcome.status !== "copied"
        );
      } catch {
        this.showStatus("\u6D77\u62A5\u590D\u5236\u5931\u8D25\u3002\u8BF7\u6539\u7528\u201C\u4E0B\u8F7D PNG\u201D\u4FDD\u5B58\u56FE\u7247\u3002", true);
      } finally {
        button.disabled = false;
      }
    }
    async copyShareText(button, text, status) {
      button.disabled = true;
      status.textContent = "";
      try {
        const outcome = await copyShareTextToClipboard(text);
        const feedback = describeTextCopyResult(outcome);
        this.showStatus(
          outcome.status === "copied" ? feedback.statusMessage : `${feedback.statusMessage} ${feedback.helpMessage}`,
          outcome.status !== "copied"
        );
      } catch {
        this.showStatus("\u6587\u6848\u590D\u5236\u5931\u8D25\u3002\u6587\u6848\u4ECD\u5728\u4E0A\u65B9\uFF0C\u53EF\u624B\u52A8\u5168\u9009\u590D\u5236\u3002", true);
      } finally {
        button.disabled = false;
      }
    }
    async copyCombined(button, text, status) {
      if (!this.poster || !this.model) return;
      button.disabled = true;
      status.textContent = "";
      try {
        const dataUrl = await this.posterPngDataUrl();
        const outcome = await copyCombinedPosterAndText(dataUrl, text);
        const feedback = describeCombinedCopyResult(outcome);
        this.showStatus(`${feedback.statusMessage} ${feedback.helpMessage}`, outcome.status === "failed");
      } catch {
        this.showStatus("\u7EC4\u5408\u590D\u5236\u5931\u8D25\u3002\u6D77\u62A5\u8BF7\u4F7F\u7528\u201C\u590D\u5236\u6D77\u62A5\u201D\u6216\u201C\u4E0B\u8F7D PNG\u201D\uFF1B\u6587\u6848\u4ECD\u5728\u4E0A\u65B9\uFF0C\u53EF\u624B\u52A8\u5168\u9009\u590D\u5236\u3002", true);
      } finally {
        button.disabled = false;
      }
    }
    async download(button, status) {
      if (!this.poster || !this.snapshot || !this.model) return;
      button.disabled = true;
      status.textContent = "";
      try {
        const dataUrl = await this.posterPngDataUrl();
        const link = document.createElement("a");
        link.download = buildPosterFilename(this.snapshot.bvid, /* @__PURE__ */ new Date(), this.options.partShare ? this.snapshot.partNumber : null);
        link.href = dataUrl;
        link.click();
        this.showStatus("PNG \u5DF2\u4E0B\u8F7D\u3002");
      } catch {
        this.showStatus("PNG \u751F\u6210\u5931\u8D25\uFF0C\u9884\u89C8\u4ECD\u4FDD\u7559\uFF1B\u8BF7\u91CD\u8BD5\u4E0B\u8F7D\u3002", true);
      } finally {
        button.disabled = false;
      }
    }
  };

  // src/ui/styles.ts
  var STYLES = String.raw`
:root { --bsp-paper:#f7f5f0; --bsp-ink:#1a1a1a; --bsp-muted:#6b6b66; --bsp-stage:#232629; --bsp-stage-line:#2e3135; --bsp-radius:16px; }
#bsp-entry { appearance:none; display:inline-flex; align-items:center; gap:7px; height:34px; margin-left:0; padding:0 14px; border:1px solid #aaa9a4; border-radius:3px; background:#fff; color:#242424; font:500 14px/1 "PingFang SC","Microsoft YaHei",sans-serif; cursor:pointer; vertical-align:middle; transition:background .15s ease,border-color .15s ease; }
#bsp-entry:hover { background:#f7f5f0; border-color:#77756f; }
#bsp-entry:focus-visible,.bsp-button:focus-visible,.bsp-close:focus-visible { outline:3px solid #00aeec; outline-offset:2px; }
#bsp-entry svg { width:18px; height:18px; }
.bsp-backdrop { position:fixed; inset:0; z-index:2147483646; display:grid; place-items:center; padding:16px; background:rgba(14,14,13,.68); font-family:"PingFang SC","Microsoft YaHei",sans-serif; animation:bsp-backdrop-in 200ms ease-out; }
.bsp-backdrop.bsp-backdrop-closing { opacity:0; transition:opacity 160ms ease-in-out; }
.bsp-panel { position:relative; width:min(1040px,calc(100vw - 56px)); max-height:calc(100vh - 56px); overflow:auto; border:1px solid #d4d0c7; border-radius:var(--bsp-radius); background:#f1eee7; box-shadow:0 28px 80px rgba(0,0,0,.34); color:#1a1a1a; animation:bsp-panel-in 240ms cubic-bezier(0.22,0.61,0.36,1); }
.bsp-panel.bsp-panel-closing { opacity:0; transform:translateY(8px) scale(0.985); transition:opacity 160ms ease-in-out,transform 160ms ease-in-out; }
.bsp-panel:focus { outline:none; }
.bsp-panel-head { display:flex; align-items:center; justify-content:space-between; min-height:52px; padding:0 18px; border-bottom:1px solid #cbc7be; background:#faf8f3; }
.bsp-close { appearance:none; width:36px; height:36px; border:0; border-radius:50%; background:transparent; color:#55524c; font-size:25px; line-height:1; cursor:pointer; }
.bsp-close:hover { background:#e7e3db; }
.bsp-eyebrow { color:var(--bsp-muted); font:700 10px/1 ui-monospace,Menlo,monospace; letter-spacing:.22em; }
.bsp-workspace { display:grid; grid-template-columns:54% 46%; min-height:600px; }
.bsp-preview-pane { display:grid; align-items:center; justify-items:center; padding:24px; border-right:1px solid var(--bsp-stage-line); background:var(--bsp-stage); }
.bsp-preview-frame { position:relative; grid-area:1/1; width:min(100%,360px); aspect-ratio:3/4; display:grid; place-items:center; filter:drop-shadow(0 14px 22px rgba(20,20,18,.22)); transition:opacity 160ms ease,transform 160ms ease; }
.bsp-preview-frame-incoming { opacity:0; transform:translateY(4px); }
.bsp-preview-frame-incoming.is-visible { opacity:1; transform:translateY(0); }
.bsp-preview-frame-exit { opacity:0; }
.bsp-poster-updating { position:absolute; inset:0; z-index:2; display:grid; place-items:center; background:rgba(255,255,255,.66); color:#55524c; font-size:13px; font-weight:600; }
.bsp-loading-card { width:min(100%,360px); aspect-ratio:3/4; display:grid; place-items:center; border:1px solid #b9b5ac; background:#f7f5f0; color:#64615b; }
.bsp-spinner { width:28px; height:28px; margin:0 auto 14px; border:2px solid #c8c4bb; border-top-color:#1a1a1a; border-radius:50%; animation:bsp-spin .75s linear infinite; }
@keyframes bsp-spin { to { transform:rotate(360deg); } }
.bsp-controls { display:flex; flex-direction:column; padding:20px 22px; overflow:auto; background:#faf8f3; }
.bsp-step { margin:0 0 10px; color:#77736b; font:600 10px/1.2 ui-monospace,Menlo,monospace; letter-spacing:.16em; }
.bsp-controls h3 { margin:0 0 12px; font-size:24px; line-height:1.25; font-weight:650; }
.bsp-options { display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:14px; }
.bsp-option-pill { appearance:none; display:inline-flex; align-items:center; justify-content:center; gap:6px; height:36px; padding:0 10px; border:1px solid var(--line, #cbc7be); border-radius:9px; background:#fff; color:#55524c; font-size:12px; font-weight:600; cursor:pointer; transition:background 150ms ease,color 150ms ease,border-color 150ms ease,transform 150ms ease; }
.bsp-option-pill:hover { border-color:#a9a59b; color:var(--bsp-ink); }
.bsp-option-pill svg { width:15px; height:15px; }
.bsp-option-pill.is-on { border-color:var(--bsp-ink); background:var(--bsp-ink); color:#fff; }
.bsp-option-pill:disabled { opacity:.55; cursor:not-allowed; }
.bsp-option-notice { margin:10px 0 0 !important; color:#7a4d1d !important; font-size:12px !important; }
.bsp-controls p { margin:0; color:#66625b; font-size:14px; line-height:1.7; }
.bsp-fallback { display:grid; gap:5px; margin-top:18px; padding:14px 16px; border-left:3px solid #9a6528; background:#f4e9d7; color:#5f431f; }
.bsp-fallback strong { font-size:13px; line-height:1.4; }
.bsp-fallback span { font-size:12px; line-height:1.55; }
.bsp-text-card { display:grid; gap:6px; max-height:96px; overflow:auto; margin-top:14px; padding:12px 14px; border:1px solid var(--line, #cbc7be); border-radius:10px; background:#fff; color:#24231f; user-select:all; }
.bsp-text-card-body { font:400 13px/1.65 "PingFang SC","Microsoft YaHei",sans-serif; white-space:pre-wrap; word-break:break-word; }
.bsp-text-card-link { font:500 11px/1.6 ui-monospace,Menlo,monospace; color:#4f6d5b; overflow-wrap:anywhere; word-break:break-all; }
.bsp-actions { margin-top:auto; display:grid; grid-template-columns:repeat(2,1fr); gap:8px; }
.bsp-action { position:relative; display:inline-flex; align-items:center; justify-content:center; gap:7px; height:44px; padding:0 10px; border:1px solid var(--line, #cbc7be); border-radius:10px; background:#fff; color:#55524c; font-size:12px; font-weight:600; cursor:pointer; transition:background 150ms ease,color 150ms ease,border-color 150ms ease,transform 150ms ease; }
.bsp-action:hover { border-color:#a9a59b; color:var(--bsp-ink); transform:translateY(-1px); }
.bsp-action svg { width:18px; height:18px; }
.bsp-action-primary { border-color:var(--bsp-ink); background:var(--bsp-ink); color:#fff; }
.bsp-action-primary:hover { filter:brightness(1.08); }
.bsp-action:disabled { opacity:.5; cursor:not-allowed; transform:none; }
.bsp-action::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 8px); left:50%; transform:translate(-50%,4px); padding:5px 8px; border-radius:6px; background:rgba(18,18,18,.88); color:#fff; font-size:11px; white-space:nowrap; opacity:0; pointer-events:none; transition:opacity 140ms ease,transform 140ms ease; z-index:3; }
.bsp-action:hover::after, .bsp-action:focus-visible::after { opacity:1; transform:translate(-50%,0); }
.bsp-button-primary { background:#1a1a1a; color:#fff; }
.bsp-button-secondary { background:#fff; color:#1a1a1a; }
.bsp-button-secondary:hover { background:#f7f5f0; }
.bsp-button { appearance:none; width:100%; min-height:46px; border:1px solid #1a1a1a; border-radius:2px; background:#1a1a1a; color:#fff; font:650 14px/1 "PingFang SC","Microsoft YaHei",sans-serif; cursor:pointer; }
.bsp-button:hover { background:#353431; }
.bsp-button:disabled { border-color:#aaa79f; background:#aaa79f; cursor:not-allowed; }
.bsp-help { margin-top:12px !important; font-size:12px !important; }
.bsp-error { margin:20px 0; padding:16px; border-left:3px solid #a3452f; background:#f5e6df; color:#6f2f20 !important; }
.bsp-status { min-height:20px; margin-top:10px !important; color:#3d6b47 !important; font-size:12px !important; opacity:0; transform:translateY(3px); transition:opacity 180ms ease,transform 180ms ease; }
.bsp-status.is-show { opacity:1; transform:translateY(0); }
.bsp-status.is-error { color:#a3452f !important; }
.bsp-poster { box-sizing:border-box; position:relative; width:360px; height:480px; overflow:hidden; padding:17px 18px 16px; border:1px solid #b7b4ac; background:#f7f5f0; color:#1a1a1a; }
.bsp-poster::after { content:""; position:absolute; inset:0; pointer-events:none; opacity:.16; background-image:radial-gradient(#776f62 .45px,transparent .55px); background-size:4px 4px; }
.bsp-masthead { position:relative; z-index:1; display:flex; align-items:flex-end; justify-content:space-between; padding-bottom:6px; border-bottom:1px solid #1a1a1a; }
.bsp-masthead strong { font:700 9px/1.1 "PingFang SC","Microsoft YaHei",sans-serif; letter-spacing:.08em; }
.bsp-masthead span { color:#6b6b66; font:600 7px/1 ui-monospace,Menlo,monospace; letter-spacing:.18em; }
.bsp-cover { position:relative; z-index:1; display:block; width:100%; height:182px; margin:10px 0 13px; border:1px solid #77736b; object-fit:cover; object-position:center; }
.bsp-cover-missing { display:grid; place-items:center; background:repeating-linear-gradient(135deg,#ece8df 0 8px,#e2ddd2 8px 16px); color:#8b877e; font:700 8px/1 ui-monospace,Menlo,monospace; letter-spacing:.14em; }
.bsp-b-cover-missing { position:absolute; inset:0; display:grid; place-items:center; background:repeating-linear-gradient(135deg,#20252a 0 10px,#15191d 10px 20px); color:rgba(255,255,255,.62); font:700 9px/1 ui-monospace,Menlo,monospace; letter-spacing:.16em; }
.bsp-poster-b.bsp-cover-missing .bsp-b-scrim { background:rgba(0,0,0,.35); }
.bsp-poster-title { position:relative; z-index:1; display:-webkit-box; overflow:hidden; margin:0; font-size:19px; line-height:1.26; font-weight:700; letter-spacing:-.02em; -webkit-box-orient:vertical; -webkit-line-clamp:2; }
.bsp-byline { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:8px; color:#55524c; font-size:9px; }
.bsp-byline strong { min-width:0; overflow:hidden; color:#262522; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
.bsp-identity { flex:none; font:600 7.5px/1 ui-monospace,Menlo,monospace; }
.bsp-part-timestamp { position:relative; z-index:1; display:flex; align-items:center; gap:6px; margin-top:7px; min-height:14px; }
.bsp-part-chip { max-width:82%; overflow:hidden; padding:2px 7px; border:1px solid #77736b; background:#f0ede6; color:#24231f; font:600 8px/1.2 "PingFang SC","Microsoft YaHei",sans-serif; text-overflow:ellipsis; white-space:nowrap; }
.bsp-time-chip { margin-left:auto; color:#1a1a1a; font:700 9px/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; }
.bsp-stats { position:relative; z-index:1; display:grid; grid-template-columns:repeat(4,1fr); margin-top:13px; border-top:2px solid #1a1a1a; border-bottom:1px solid #aaa69d; }
.bsp-stat { padding:8px 5px 7px; border-right:1px solid #c6c2b9; }
.bsp-stat:last-child { border-right:0; }
.bsp-stat strong,.bsp-stat span { display:block; }
.bsp-stat strong { white-space:nowrap; font:750 clamp(14px,4.3vw,16px)/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; letter-spacing:-.025em; }
.bsp-stat span { margin-top:5px; color:#6b6b66; font-size:7px; letter-spacing:.18em; }
.bsp-destination { position:relative; z-index:1; display:grid; grid-template-columns:78px 1fr; gap:13px; align-items:center; margin-top:13px; }
.bsp-qr { box-sizing:border-box; display:block; width:78px; height:78px; background:#fff; }
.bsp-link-label { display:block; margin-bottom:7px; color:#6b6b66; font-size:7px; letter-spacing:.17em; }
.bsp-link { display:block; overflow-wrap:anywhere; color:#1a1a1a; font:600 8px/1.45 ui-monospace,Menlo,monospace; word-break:break-all; }
.bsp-archive { position:absolute; right:18px; bottom:7px; z-index:1; color:#8b877e; font:600 6px/1 ui-monospace,Menlo,monospace; letter-spacing:.12em; }
.bsp-theme-segment { display:inline-flex; align-self:flex-start; padding:3px; border:1px solid var(--line, #cbc7be); border-radius:9px; background:rgba(0,0,0,.04); }
.bsp-theme-option { appearance:none; display:inline-flex; align-items:center; height:30px; padding:0 12px; border:0; border-radius:7px; background:transparent; color:var(--bsp-muted); font-size:12px; font-weight:600; cursor:pointer; transition:background 160ms ease,color 160ms ease,box-shadow 160ms ease; }
.bsp-theme-option.is-active { background:var(--bsp-ink); color:#fff; box-shadow:0 2px 8px rgba(0,0,0,.16); }
#bsp-entry.bsp-entry-b { background:#18191c; border-color:#18191c; color:#fff; }
#bsp-entry.bsp-entry-b:hover { background:#343a40; border-color:#343a40; }
.bsp-backdrop.bsp-theme-b { background:rgba(5,6,8,.78); }
.bsp-panel.bsp-theme-b { border-color:#3d4045; background:#18191c; color:#f1f2f3; }
.bsp-panel.bsp-theme-b .bsp-panel-head { border-bottom-color:#2e3135; background:#101113; }
.bsp-panel.bsp-theme-b .bsp-close { color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-close:hover { background:#2e3135; }
.bsp-panel.bsp-theme-b .bsp-preview-pane { border-right-color:#2e3135; background:var(--bsp-stage); }
.bsp-panel.bsp-theme-b .bsp-controls { background:#18191c; }
.bsp-panel.bsp-theme-b .bsp-controls p, .bsp-panel.bsp-theme-b .bsp-step { color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-option-pill { border-color:#3d4045; background:#232528; color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-option-pill.is-on { border-color:#f1f2f3; background:#f1f2f3; color:#18191c; }
.bsp-panel.bsp-theme-b .bsp-text-card { border-color:#2e3135; background:#101113; color:#e8e9eb; }
.bsp-panel.bsp-theme-b .bsp-text-card-link { color:#9fc4ac; }
.bsp-panel.bsp-theme-b .bsp-theme-segment { border-color:#3d4045; background:#232528; }
.bsp-panel.bsp-theme-b .bsp-theme-option { color:#c9cdd2; }
.bsp-panel.bsp-theme-b .bsp-theme-option.is-active { background:#f1f2f3; color:#18191c; }
.bsp-panel.bsp-theme-b .bsp-action { border-color:#3d4045; background:#232528; color:#e8e9eb; }
.bsp-panel.bsp-theme-b .bsp-action-primary { border-color:#f1f2f3; background:#f1f2f3; color:#18191c; }
.bsp-panel.bsp-theme-b .bsp-button-primary { border-color:#f1f2f3; background:#f1f2f3; color:#18191c; }
.bsp-panel.bsp-theme-b .bsp-button-secondary { border-color:#8a9096; background:#2e3135; color:#fff; }
.bsp-panel.bsp-theme-b .bsp-button-secondary:hover { background:#3d4045; }
.bsp-poster.bsp-poster-b { padding:0; border:0; background:#000; color:#fff; }
.bsp-poster-b::after { display:none; }
.bsp-cover-b { position:absolute; inset:0; z-index:0; display:block; width:100%; height:100%; object-fit:cover; object-position:center; }
.bsp-b-scrim { position:absolute; inset:0; z-index:1; background:linear-gradient(180deg,rgba(0,0,0,.08) 0%,rgba(0,0,0,.28) 38%,rgba(0,0,0,.86) 78%,rgba(0,0,0,.94) 94%); }
.bsp-b-content { position:relative; z-index:2; display:flex; flex-direction:column; height:100%; padding:16px; }
.bsp-b-topline { display:flex; align-items:center; gap:8px; min-height:24px; }
.bsp-b-part-chip, .bsp-b-time-chip { overflow:hidden; padding:3px 9px; border:1px solid rgba(255,255,255,.32); border-radius:14px; background:rgba(0,0,0,.55); color:#fff; text-overflow:ellipsis; white-space:nowrap; backdrop-filter:blur(2px); }
.bsp-b-part-chip { max-width:76%; font:600 8px/1.2 "PingFang SC","Microsoft YaHei",sans-serif; }
.bsp-b-time-chip { margin-left:auto; font:700 9px/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; }
.bsp-b-bottom { margin-top:auto; }
.bsp-b-title { display:-webkit-box; overflow:hidden; margin:0; color:#fff; font-size:19px; font-weight:800; line-height:1.4; letter-spacing:-.02em; text-shadow:0 2px 12px rgba(0,0,0,.7); -webkit-box-orient:vertical; -webkit-line-clamp:3; }
.bsp-b-up { margin-top:8px; overflow:hidden; color:rgba(255,255,255,.9); font-size:9px; font-weight:600; text-overflow:ellipsis; white-space:nowrap; }
.bsp-b-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; margin-top:12px; padding:9px 12px; border:1px solid rgba(255,255,255,.16); border-radius:10px; background:rgba(0,0,0,.42); backdrop-filter:blur(3px); }
.bsp-b-stat { min-width:0; text-align:center; }
.bsp-b-stat strong, .bsp-b-stat span { display:block; }
.bsp-b-stat strong { overflow:hidden; color:#fff; font:750 11px/1 ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums; text-overflow:ellipsis; white-space:nowrap; }
.bsp-b-stat span { margin-top:3px; color:rgba(255,255,255,.62); font-size:7px; letter-spacing:.12em; }
.bsp-b-identity { margin-top:8px; color:rgba(255,255,255,.6); font:600 8px/1 ui-monospace,Menlo,monospace; letter-spacing:.08em; text-align:center; }
.bsp-b-destination { display:flex; align-items:center; gap:10px; margin-top:10px; }
.bsp-b-qr { box-sizing:border-box; flex:none; width:72px; height:72px; padding:4px; border-radius:5px; background:#fff; }
.bsp-b-link-side { min-width:0; flex:1; }
.bsp-b-link-label { display:block; margin-bottom:5px; color:rgba(255,255,255,.58); font-size:7px; letter-spacing:.16em; }
.bsp-b-link { display:block; overflow-wrap:anywhere; color:#fff; font:600 8px/1.45 ui-monospace,Menlo,monospace; word-break:break-all; text-shadow:0 1px 4px rgba(0,0,0,.8); }
@keyframes bsp-backdrop-in { from { opacity:0; } }
@keyframes bsp-panel-in { from { opacity:0; transform:translateY(10px) scale(0.985); } }
@media (max-width:880px) { .bsp-workspace { grid-template-columns:1fr; min-height:0; } .bsp-preview-pane { border-right:0; border-bottom:1px solid var(--bsp-stage-line); } .bsp-controls { min-height:360px; padding:20px; } }
@media (prefers-reduced-motion:reduce) {
  .bsp-spinner { animation:none; }
  .bsp-backdrop, .bsp-panel, .bsp-preview-frame, .bsp-option-pill, .bsp-action, .bsp-theme-option, .bsp-status, #bsp-entry { transition:none; animation:none; }
  .bsp-backdrop.bsp-backdrop-closing { opacity:0; }
  .bsp-panel.bsp-panel-closing { opacity:0; transform:none; }
  .bsp-preview-frame-incoming { opacity:1; transform:none; }
  .bsp-preview-frame-exit { opacity:0; }
}
`;

  // src/index.ts
  var activePanel = null;
  var mountQueued = false;
  function installStyles() {
    if (document.getElementById("bsp-styles")) return;
    const style = document.createElement("style");
    style.id = "bsp-styles";
    style.textContent = STYLES;
    document.head.append(style);
  }
  function openPanel() {
    if (activePanel) {
      activePanel.focus();
      return;
    }
    activePanel = new SharePanel(() => {
      activePanel = null;
    });
    activePanel.open();
  }
  function rememberedTheme() {
    return loadRememberedPreferences().theme;
  }
  function mountEntry() {
    mountQueued = false;
    if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
    if (!readPageIdentity()) return;
    mountSharePosterEntry(rememberedTheme(), openPanel);
  }
  function queueMount() {
    if (mountQueued) return;
    mountQueued = true;
    window.requestAnimationFrame(mountEntry);
  }
  function handleLocationChange() {
    if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
    removeSharePosterEntry();
    queueMount();
  }
  installStyles();
  queueMount();
  new MutationObserver(queueMount).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("urlchange", handleLocationChange);
  window.addEventListener("popstate", handleLocationChange);
  if (typeof GM_registerMenuCommand === "function") {
    GM_registerMenuCommand("\u751F\u6210\u5206\u4EAB\u6D77\u62A5", () => {
      if (!readPageIdentity()) return;
      openPanel();
    });
  }
})();
