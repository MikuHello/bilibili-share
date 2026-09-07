// ==UserScript==
// @name         Bilibili 分享海报
// @namespace    https://github.com/mikuhello/bilibili-share
// @version      0.2.0
// @description  在 Bilibili 标准视频页生成默认主题分享海报，复制普通文案、Markdown 与图文组合内容
// @match        https://www.bilibili.com/video/BV*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        window.onurlchange
// @connect      api.bilibili.com
// @connect      hdslb.com
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

  // ../bilibili-share/node_modules/qrcode/lib/can-promise.js
  var require_can_promise = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/can-promise.js"(exports, module) {
      module.exports = function() {
        return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
      };
    }
  });

  // ../bilibili-share/node_modules/qrcode/lib/core/utils.js
  var require_utils = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/utils.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/error-correction-level.js
  var require_error_correction_level = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/bit-buffer.js
  var require_bit_buffer = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/bit-matrix.js
  var require_bit_matrix = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/alignment-pattern.js
  var require_alignment_pattern = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/finder-pattern.js
  var require_finder_pattern = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/mask-pattern.js
  var require_mask_pattern = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/error-correction-code.js
  var require_error_correction_code = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/galois-field.js
  var require_galois_field = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/galois-field.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/polynomial.js
  var require_polynomial = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/polynomial.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/reed-solomon-encoder.js
  var require_reed_solomon_encoder = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/version-check.js
  var require_version_check = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/version-check.js"(exports) {
      exports.isValid = function isValid(version) {
        return !isNaN(version) && version >= 1 && version <= 40;
      };
    }
  });

  // ../bilibili-share/node_modules/qrcode/lib/core/regex.js
  var require_regex = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/regex.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/mode.js
  var require_mode = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/mode.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/version.js
  var require_version = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/version.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/format-info.js
  var require_format_info = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/format-info.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/numeric-data.js
  var require_numeric_data = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/alphanumeric-data.js
  var require_alphanumeric_data = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/byte-data.js
  var require_byte_data = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/kanji-data.js
  var require_kanji_data = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
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

  // ../bilibili-share/node_modules/dijkstrajs/dijkstra.js
  var require_dijkstra = __commonJS({
    "../bilibili-share/node_modules/dijkstrajs/dijkstra.js"(exports, module) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/segments.js
  var require_segments = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/segments.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/core/qrcode.js
  var require_qrcode = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/core/qrcode.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/renderer/utils.js
  var require_utils2 = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/renderer/utils.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/renderer/canvas.js
  var require_canvas = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/renderer/canvas.js"(exports) {
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
        const image2 = ctx.createImageData(size, size);
        Utils.qrToImageData(image2.data, qrData, opts);
        clearCanvas(ctx, canvasEl, size);
        ctx.putImageData(image2, 0, 0);
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

  // ../bilibili-share/node_modules/qrcode/lib/renderer/svg-tag.js
  var require_svg_tag = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
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

  // ../bilibili-share/node_modules/qrcode/lib/browser.js
  var require_browser = __commonJS({
    "../bilibili-share/node_modules/qrcode/lib/browser.js"(exports) {
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
  function parseCanonicalVideoIdentity(rawUrl) {
    let url;
    try {
      url = new URL(rawUrl);
    } catch {
      return null;
    }
    const match = url.pathname.match(/^\/video\/(BV[0-9A-Za-z]+)\/?$/i);
    if (url.protocol !== "https:" || url.hostname !== "www.bilibili.com" || url.username || url.password || url.port || !match) {
      return null;
    }
    return {
      bvid: match[1],
      part: url.searchParams.get("p"),
      timestamp: url.searchParams.get("t")
    };
  }
  function buildCanonicalShareTarget(bvid, context, options) {
    if (!/^BV[0-9A-Za-z]+$/i.test(bvid)) throw new Error("\u5206\u4EAB\u94FE\u63A5\u65E0\u6548");
    const params = [];
    if (options.partShare) params.push(`p=${context.partNumber}`);
    if (options.timestampShare && (context.partNumber === 1 || options.partShare) && Math.floor(context.playbackSeconds) >= 1) {
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
  function gmTextRequest(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url,
        timeout: 15e3,
        anonymous: true,
        headers: { Referer: "https://www.bilibili.com/" },
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
  var CoverLoadError = class extends Error {
    constructor(stage, facts = {}) {
      super("\u5C01\u9762\u6682\u65F6\u65E0\u6CD5\u52A0\u8F7D");
      this.stage = stage;
      this.facts = facts;
    }
  };
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
            reject(new CoverLoadError("http-status", { status: response.status }));
            return;
          }
          resolve(response.response);
        },
        ontimeout: () => reject(new CoverLoadError("timeout")),
        onerror: () => reject(new CoverLoadError("network-error"))
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
      aid: requiredPositiveInteger(data.aid, "av \u6807\u8BC6"),
      coverUrl: typeof data.pic === "string" ? data.pic.trim() : "",
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
      throw new CoverLoadError("invalid-blob", { bytes: blob.size, imageType: blob.type.startsWith("image/") ? "image" : "non-image" });
    }
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new CoverLoadError("file-reader"));
      reader.readAsDataURL(blob);
    });
    const image2 = new Image();
    image2.src = dataUrl;
    try {
      await image2.decode();
    } catch {
      throw new CoverLoadError("decode", { bytes: blob.size });
    }
    if (!isUsableCover(image2.naturalWidth, image2.naturalHeight)) throw new CoverLoadError("dimensions", { width: image2.naturalWidth, height: image2.naturalHeight });
    return dataUrl;
  }
  async function loadCover(coverUrl) {
    try {
      if (!coverUrl) throw new CoverLoadError("missing-url");
      const blob = await gmBlobRequest(coverUrl.replace(/^http:/, "https:"));
      return { dataUrl: await blobToImageDataUrl(blob), unavailable: false };
    } catch (error) {
      const failure = error instanceof CoverLoadError ? error : new CoverLoadError("unexpected");
      console.warn("[Bilibili Share] cover", { stage: failure.stage, ...failure.facts });
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
  function restorePlayback(capture) {
    if (!capture.wasPlaying || !capture.player.isConnected) return;
    const current = readPageIdentity();
    if (!current || current.bvid.toUpperCase() !== capture.bvid.toUpperCase() || current.partNumber !== capture.partNumber) return;
    void capture.player.play().catch(() => void 0);
  }

  // src/ui/appearance.ts
  function backgroundAppearance(node) {
    const color = getComputedStyle(node).backgroundColor;
    if (!CSS.supports("color", color)) return null;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.fillStyle = color;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b, alpha] = context.getImageData(0, 0, 1, 1).data;
    if (alpha < 250) return null;
    const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    if (brightness < 0.4) return "dark";
    if (brightness > 0.65) return "light";
    return null;
  }
  function readPageAppearance() {
    const roots = [document.documentElement, document.body].filter((node) => node !== null);
    const dark = roots.some((node) => node.classList.contains("dark") || node.classList.contains("bili_dark"));
    const light = roots.some((node) => node.classList.contains("light"));
    if (dark && light) return null;
    if (dark) return "dark";
    if (light) return "light";
    for (const node of [...roots].reverse()) {
      const appearance = backgroundAppearance(node);
      if (appearance) return appearance;
    }
    return null;
  }
  function observePageAppearance(onChange) {
    let current = readPageAppearance() ?? "light";
    let frame = 0;
    let stopped = false;
    let body = document.body;
    const refresh = () => {
      frame = 0;
      if (stopped) return;
      if (body !== document.body) {
        body = document.body;
        if (body) observer.observe(body, { attributes: true, attributeFilter: ["class", "style"] });
      }
      const next = readPageAppearance() ?? current;
      if (next !== current) {
        current = next;
        onChange(current);
      }
    };
    const schedule = () => {
      if (!frame && !stopped) frame = requestAnimationFrame(refresh);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"], childList: true });
    if (body) observer.observe(body, { attributes: true, attributeFilter: ["class", "style"] });
    if (document.head) observer.observe(document.head, { childList: true, subtree: true, attributes: true, characterData: true });
    const events = ["global.themeChange", "darkModeBaseColorChange", "pageshow"];
    for (const event of events) window.addEventListener(event, schedule);
    const stylesheetLoaded = (event) => {
      if (event.target instanceof HTMLLinkElement) schedule();
    };
    document.addEventListener("load", stylesheetLoaded, true);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", schedule);
    onChange(current);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      for (const event of events) window.removeEventListener(event, schedule);
      document.removeEventListener("load", stylesheetLoaded, true);
      media.removeEventListener("change", schedule);
    };
  }

  // src/ui/icons.ts
  var ICON_PATHS = {
    poster: ["M4 5.5h16v13H4z", "M7 15l3.2-3.4 2.4 2.4 1.8-1.9 2.6 2.7", "M8.4 8.4h.01"],
    copy: ["M10 8h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z", "M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"],
    download: ["M12 3v12", "m8 11 4 4 4-4", "M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"],
    "copy-text": ["M8 9h8", "M8 13h5", "M4 4h16v16H4z"],
    combined: ["M5 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z", "m6 12 3-3 3 3", "M18 8h3M18 12h3M8 20h13"],
    list: ["M5 5h14", "M5 12h14", "M5 19h14"],
    clock: ["M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0", "M12 7v5l3 2"],
    detail: ["M4 7h16", "M4 12h10", "M4 17h16", "m16 13 2 2 4-4"],
    markdown: ["M5 16V8l3 5 3-5v8", "M15 8h4l-4 4 4 4h-4"],
    close: ["M6 6l12 12", "M18 6 6 18"]
  };
  function createIcon(name) {
    const svg2 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg2.setAttribute("viewBox", "0 0 24 24");
    svg2.setAttribute("aria-hidden", "true");
    svg2.setAttribute("fill", "none");
    svg2.setAttribute("stroke", "currentColor");
    svg2.setAttribute("stroke-width", "1.8");
    svg2.setAttribute("stroke-linecap", "round");
    svg2.setAttribute("stroke-linejoin", "round");
    for (const d of ICON_PATHS[name]) {
      const path = document.createElementNS(svg2.namespaceURI, "path");
      path.setAttribute("d", d);
      svg2.append(path);
    }
    return svg2;
  }
  function posterIcon() {
    return createIcon("poster");
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
      const candidate = Array.from(document.querySelectorAll(selector)).find((item) => item.querySelector(".video-share-wrap"));
      if (candidate) return candidate;
    }
    const legacyShareWrap = document.querySelector(LEGACY_SHARE_WRAP_SELECTORS);
    return legacyShareWrap?.parentElement ?? null;
  }
  function createSharePosterEntry(appearance, onOpen) {
    const button = document.createElement("button");
    button.id = ENTRY_ID;
    button.type = "button";
    button.title = "\u751F\u6210\u5206\u4EAB\u6D77\u62A5";
    button.append(posterIcon(), document.createTextNode("\u751F\u6210\u6D77\u62A5"));
    button.addEventListener("click", onOpen);
    button.classList.toggle("bsp-entry-dark", appearance === "dark");
    return button;
  }
  function removeSharePosterEntry() {
    document.getElementById(ENTRY_ID)?.remove();
  }
  function mountSharePosterEntry(appearance, onOpen) {
    if (document.getElementById(ENTRY_ID)) return false;
    const anchor = findToolbarAnchor();
    if (!anchor?.parentElement) return false;
    anchor.insertAdjacentElement("afterend", createSharePosterEntry(appearance, onOpen));
    return true;
  }
  function setEntryAppearance(appearance) {
    document.getElementById(ENTRY_ID)?.classList.toggle("bsp-entry-dark", appearance === "dark");
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
      helpMessage: "\u8BF7\u4F7F\u7528\u6D77\u62A5\u4E0B\u65B9\u7684\u4E0B\u8F7D\u56FE\u6807\u4FDD\u5B58 PNG\u3002",
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
        helpMessage: "\u6D77\u62A5\u4ECD\u9700\u5355\u72EC\u590D\u5236\u6216\u4E0B\u8F7D PNG\u3002"
      };
    }
    return {
      statusMessage: "\u7EC4\u5408\u590D\u5236\u5931\u8D25\u3002",
      helpMessage: "\u6587\u6848\u4ECD\u5728\u4E0A\u65B9\uFF0C\u53EF\u624B\u52A8\u5168\u9009\u590D\u5236\uFF1B\u6D77\u62A5\u8BF7\u4F7F\u7528\u201C\u590D\u5236\u6D77\u62A5\u201D\u6216\u201C\u4E0B\u8F7D PNG\u201D\u3002"
    };
  }
  async function copyCombinedPosterAndText(posterDataUrl, shareText, canContinue = () => true) {
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
        writeText: async (text) => {
          if (!canContinue()) throw new Error("\u5206\u4EAB\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548");
          const outcome = await copyShareTextToClipboard(text);
          if (outcome.status === "failed") throw new Error(outcome.reason);
        }
      };
      return copyCombined(posterDataUrl, shareText, ports);
    }
    if (!canContinue()) return { status: "failed", reason: "\u5206\u4EAB\u4E0A\u4E0B\u6587\u5DF2\u5931\u6548" };
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
  function formatCompactStat(value) {
    if (value === null || !Number.isFinite(value)) return "--";
    if (value >= 999995e6) return value.toExponential(1).replace("+", "");
    if (value >= 99999500) return `${(value / 1e8).toFixed(1)}\u4EBF`;
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
    if (url.protocol !== "https:" || !isCanonical) {
      throw new Error("\u5206\u4EAB\u94FE\u63A5\u65E0\u6548");
    }
    return url.toString();
  }
  function buildSharePoster(snapshot, shareTarget) {
    const title = requireText(snapshot.title, "\u89C6\u9891\u6807\u9898");
    const coverDataUrl = snapshot.coverUnavailable ? "" : requireText(snapshot.coverDataUrl, "\u89C6\u9891\u5C01\u9762");
    const uploader = requireText(snapshot.uploader, "UP \u4E3B");
    const bvid = requireText(snapshot.bvid, "BV \u6807\u8BC6");
    if (!Number.isSafeInteger(snapshot.aid) || snapshot.aid <= 0) throw new Error("\u7F3A\u5C11av \u6807\u8BC6");
    const validatedShareTarget = validateShareTarget(shareTarget, bvid);
    return {
      dimensions: { width: 1080, height: 1440 },
      coverDataUrl,
      coverUnavailable: snapshot.coverUnavailable,
      title,
      uploader,
      bvid,
      aid: snapshot.aid,
      identity: `${bvid} \xB7 av${snapshot.aid}`,
      shareTarget: validatedShareTarget,
      stats: [
        { label: "\u64AD\u653E", value: formatCompactStat(snapshot.stats.views) },
        { label: "\u70B9\u8D5E", value: formatCompactStat(snapshot.stats.likes) },
        { label: "\u6295\u5E01", value: formatCompactStat(snapshot.stats.coins) },
        { label: "\u6536\u85CF", value: formatCompactStat(snapshot.stats.favorites) }
      ]
    };
  }

  // src/options.ts
  function createDefaultShareOptions() {
    return {
      partShare: false,
      timestampShare: false,
      detailedText: false,
      markdownText: false
    };
  }
  function resolveRememberedPreferences(stored) {
    const record = typeof stored === "object" && stored !== null ? stored : {};
    return {
      detailedText: record.detailedText === true,
      markdownText: false
    };
  }
  function createPanelShareOptions(storedPreferences = null) {
    const remembered = resolveRememberedPreferences(storedPreferences);
    return {
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
      `BV/av\uFF1A${snapshot.bvid} \xB7 av${snapshot.aid}`,
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
  function escapeMarkdown(value) {
    return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replace(/([\\`*_[\]{}()#+.!|>~-])/g, "\\$1");
  }
  function markdownDetailedText(snapshot, shareTarget, options) {
    const lines = [
      `**${escapeMarkdown(snapshot.title)}**`,
      "",
      `- UP\u4E3B\uFF1A${escapeMarkdown(snapshot.uploader)}`,
      `- BV/av\uFF1A${snapshot.bvid} \xB7 av${snapshot.aid}`,
      `- \u64AD\u653E\uFF1A${formatExactStat(snapshot.stats.views)} \xB7 \u70B9\u8D5E\uFF1A${formatExactStat(snapshot.stats.likes)} \xB7 \u6295\u5E01\uFF1A${formatExactStat(snapshot.stats.coins)} \xB7 \u6536\u85CF\uFF1A${formatExactStat(snapshot.stats.favorites)}`
    ];
    const partLabel = buildPartLabel(snapshot, options);
    if (partLabel) lines.push(`- \u5206P\uFF1A${escapeMarkdown(partLabel)}`);
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
      return `[${escapeMarkdown(snapshot.title)}](${shareTarget})\uFF08UP\u4E3B\uFF1A${escapeMarkdown(snapshot.uploader)}\uFF09
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

  // src/ui/feedback.ts
  function statusDismissDelay(failed) {
    return failed ? null : 3e3;
  }

  // src/ui/motion.ts
  var MOTION = { fast: 160, backdrop: 200, open: 240, color: 180, overlay: 140 };
  function motionDelay(duration) {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
  }
  var MOTION_STYLES = `
.bsp-backdrop, #bsp-entry {
  --bsp-motion-fast:${MOTION.fast}ms;
  --bsp-motion-backdrop:${MOTION.backdrop}ms;
  --bsp-motion-open:${MOTION.open}ms;
  --bsp-motion-color:${MOTION.color}ms;
  --bsp-motion-overlay:${MOTION.overlay}ms;
  --bsp-ease-out:cubic-bezier(.22,.61,.36,1);
  --bsp-ease-in-out:cubic-bezier(.4,0,.2,1);
}
@media (prefers-reduced-motion:reduce) {
  .bsp-backdrop *, .bsp-backdrop *::before, .bsp-backdrop *::after, .bsp-backdrop, #bsp-entry {
    animation-duration:0ms !important;
    transition-duration:0ms !important;
  }
}`;

  // src/ui/posters.ts
  var import_qrcode = __toESM(require_browser(), 1);

  // ../bilibili-share/node_modules/html-to-image/es/util.js
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
  async function svgToDataURL(svg2) {
    return Promise.resolve().then(() => new XMLSerializer().serializeToString(svg2)).then(encodeURIComponent).then((html) => `data:image/svg+xml;charset=utf-8,${html}`);
  }
  async function nodeToDataURL(node, width, height) {
    const xmlns = "http://www.w3.org/2000/svg";
    const svg2 = document.createElementNS(xmlns, "svg");
    const foreignObject = document.createElementNS(xmlns, "foreignObject");
    svg2.setAttribute("width", `${width}`);
    svg2.setAttribute("height", `${height}`);
    svg2.setAttribute("viewBox", `0 0 ${width} ${height}`);
    foreignObject.setAttribute("width", "100%");
    foreignObject.setAttribute("height", "100%");
    foreignObject.setAttribute("x", "0");
    foreignObject.setAttribute("y", "0");
    foreignObject.setAttribute("externalResourcesRequired", "true");
    svg2.appendChild(foreignObject);
    foreignObject.appendChild(node);
    return svgToDataURL(svg2);
  }
  var isInstanceOfElement = (node, instance) => {
    if (node instanceof instance)
      return true;
    const nodePrototype = Object.getPrototypeOf(node);
    if (nodePrototype === null)
      return false;
    return nodePrototype.constructor.name === instance.name || isInstanceOfElement(nodePrototype, instance);
  };

  // ../bilibili-share/node_modules/html-to-image/es/clone-pseudos.js
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

  // ../bilibili-share/node_modules/html-to-image/es/mimes.js
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

  // ../bilibili-share/node_modules/html-to-image/es/dataurl.js
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

  // ../bilibili-share/node_modules/html-to-image/es/clone-node.js
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
      const svg2 = document.createElementNS(ns, "svg");
      svg2.setAttribute("xmlns", ns);
      svg2.style.position = "absolute";
      svg2.style.width = "0";
      svg2.style.height = "0";
      svg2.style.overflow = "hidden";
      svg2.style.display = "none";
      const defs = document.createElementNS(ns, "defs");
      svg2.appendChild(defs);
      for (let i = 0; i < nodes.length; i++) {
        defs.appendChild(nodes[i]);
      }
      clone.appendChild(svg2);
    }
    return clone;
  }
  async function cloneNode(node, options, isRoot) {
    if (!isRoot && options.filter && !options.filter(node)) {
      return null;
    }
    return Promise.resolve(node).then((clonedNode) => cloneSingleNode(clonedNode, options)).then((clonedNode) => cloneChildren(node, clonedNode, options)).then((clonedNode) => decorate(node, clonedNode, options)).then((clonedNode) => ensureSVGSymbols(clonedNode, options));
  }

  // ../bilibili-share/node_modules/html-to-image/es/embed-resources.js
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

  // ../bilibili-share/node_modules/html-to-image/es/embed-images.js
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
      const image2 = clonedNode;
      if (image2.decode) {
        image2.decode = resolve;
      }
      if (image2.loading === "lazy") {
        image2.loading = "eager";
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

  // ../bilibili-share/node_modules/html-to-image/es/apply-style.js
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

  // ../bilibili-share/node_modules/html-to-image/es/embed-webfonts.js
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

  // ../bilibili-share/node_modules/html-to-image/es/index.js
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
    const svg2 = await toSvg(node, options);
    const img = await createImage(svg2);
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

  // src/ui/poster-assets.ts
  var posterAssets = {
    "brand": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%202240%201024%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20fill%3D%22%2300AEEC%22%20d%3D%22M2079.810048%20913.566175c-10.01309%200-18.554608%200.799768-26.936172-0.159954-16.987063-1.951433-33.974126-1.567544-50.99318-2.079395-10.972811-0.287916-10.652904-0.287916-11.580634-10.90883-2.71921-32.406582-5.694345-64.781173-8.605499-97.155764-2.527266-28.439735-4.926568-56.91146-7.70976-85.319204-2.527266-26.040432-5.566382-52.016883-8.317583-78.025324-2.623238-24.440897-5.054531-48.913784-7.77374-73.322691a12681.114551%2012681.114551%200%200%200-10.684895-92.133223c-3.295042-27.128116-6.558094-54.320213-10.205034-81.416339a20559.272961%2020559.272961%200%200%200-17.530905-125.979387c-6.398141-44.723002-14.075909-89.22207-22.105576-133.657156-1.439582-7.965685-1.247637-8.253601%206.36615-9.533229%2031.670796-5.406429%2063.501545-10.01309%2095.716183-9.309295%203.486987%200.095972%207.005964%200.159954%2010.460959%200.607823%205.662354%200.703795%208.605499%203.454996%208.925406%2010.045081%201.119675%2022.969325%202.71921%2045.938649%204.414717%2068.875983%202.71921%2037.589076%205.662354%2075.178151%208.477537%20112.735236%201.791479%2024.184971%203.327033%2048.305961%205.150503%2072.426951%202.911154%2038.772732%205.982261%2077.513473%208.925406%20116.286205%201.791479%2023.705111%203.359024%2047.474203%205.182494%2071.179313%202.783191%2034.805885%205.822308%2069.579778%208.637489%20104.353672%201.791479%2022.137566%203.391014%2044.307123%205.278466%2066.44469%202.783191%2032.79047%205.790317%2065.580941%208.63749%2098.371411%202.143377%2025.592562%204.09481%2051.249106%206.270178%2077.673426zM853.670395%20114.918282c4.638652%200%2011.644616-0.511851%2018.554607%200.127963%208.797443%200.799768%2010.49295%203.071107%2011.036793%2011.900541%202.527266%2040.372267%204.894578%2080.776524%207.581796%20121.180782%202.943145%2043.571337%206.174206%2087.078693%209.405267%20130.586048%202.975135%2039.956388%205.950271%2079.912775%209.149341%20119.869163%203.486987%2043.891244%207.357862%2087.718507%2010.876839%20131.609751%202.655228%2033.622229%204.926568%2067.244457%207.677768%20100.898677%202.623238%2031.222926%205.694345%2062.38187%208.509527%2093.572805%202.399303%2026.8402%204.830596%2053.71239%207.165918%2080.58458%200.735786%208.509527%200.127963%209.053369-9.053369%208.829434-24.025018-0.575833-47.922073-3.391014-71.947091-2.71921-5.502401%200.159954-7.101936-2.367312-8.029666-7.581796-1.983424-11.356699-1.663517-22.905343-2.879163-34.390006-3.295042-30.359177-5.182494-60.846317-7.965685-91.269474-2.495275-27.639967-5.502401-55.215953-8.349574-82.82393-2.527266-25.240664-5.02254-50.481329-7.709759-75.753984-2.687219-24.792795-5.534392-49.61758-8.349573-74.442365-2.591247-22.841362-5.118512-45.682723-7.869713-68.524085-4.062819-33.462275-8.093648-66.92455-12.508365-100.322844-4.062819-30.647093-8.66948-61.198214-12.988225-91.813317-5.886289-41.587914-12.508365-83.079855-19.834236-124.411842a1393.96288%201393.96288%200%200%200-5.310457-28.023856c-0.959721-4.702633-0.095972-7.421843%205.278466-8.157629%2014.139891-1.887451%2028.24779-4.830596%2042.451663-6.206196%2014.203872-1.311619%2028.407744-3.966847%2045.106891-2.71921z%20m1006.075609%20403.33878c27.064134%200%2027.703949%200.191944%2032.054684%2024.536869%205.342447%2030.03927%209.08536%2060.334465%2012.636328%2090.62966%203.742912%2032.278619%207.517815%2064.557238%2010.972811%2096.867848%202.783191%2026.008441%205.118512%2052.080864%207.74175%2078.089305%202.7512%2027.256079%205.662354%2054.416185%208.509527%2081.640274%201.567544%2015.387528%203.039117%2030.775056%204.798605%2046.130593%200.511851%204.446708-0.831758%206.81402-5.214485%207.325871-9.245313%201.055693-18.426645%202.27134-27.639967%203.263052-16.891091%201.82347-33.814173%203.614949-50.737254%205.182493-8.733462%200.799768-9.309294%200.319907-10.940821-8.125638-14.843686-76.617733-29.719363-153.171485-44.435086-229.821208-9.789155-50.961189-19.322384-101.95437-28.919595-152.915559a805.525894%20805.525894%200%200%201-3.582959-21.081873c-0.639814-4.030829%200.44787-6.622075%205.022541-7.70976%2030.48714-7.133927%2061.294186-12.636328%2089.733921-14.011927z%20m-1137.077537%200c28.951586%200%2028.823623%200.095972%2033.302322%2026.360339%206.909992%2040.660183%2011.804569%2081.544301%2016.187295%20122.556382%204.286754%2039.796434%208.957397%2079.560878%2013.148179%20119.357311%202.847173%2027.224088%205.086522%2054.512157%207.74175%2081.704255%201.887451%2019.354375%204.126801%2038.644769%206.174206%2057.967153%200.255926%202.367312%200.383888%204.734624%200.543842%207.133927%200.415879%209.469248%200%2010.237025-9.117351%2011.164755-18.074747%201.887451-36.181485%203.454996-54.256232%205.246476-6.558094%200.639814-13.084197%201.599535-19.57831%202.239349-8.63749%200.799768-8.925406%200.767777-10.620913-7.965685-6.078234-30.679084-11.964523-61.422149-17.914793-92.101233-14.267853-73.898523-28.69566-147.733065-42.867542-221.631589-5.662354-29.559409-10.524941-59.246781-16.091323-88.838181-1.023702-5.406429-0.255926-7.933694%205.342447-9.245313%2030.199223-7.037955%2060.590391-12.540355%2088.006423-13.947946z%20m382.128944%20309.861946v124.027954c0%201.183656-0.127963%202.399303%200.03199%203.582959%200.607823%206.014252-1.599535%208.66948-7.805731%208.413555-8.157629-0.351898-16.251277-0.127963-24.408906%200.063981-17.019054%200.319907-34.070098-0.351898-51.057162%201.599535-9.405267%201.087684-9.213322%200.511851-10.141052-9.405266-2.783191-31.222926-5.822308-62.413861-8.669481-93.636787-2.623238-28.823623-4.99055-57.711228-7.677768-86.534851-2.71921-29.655381-5.758326-59.214791-8.509527-88.838181-1.887451-19.770254-3.550968-39.508518-5.214485-59.278772-2.175368-25.720525-4.190782-51.409059-6.462122-77.129585-0.959721-10.844848-0.159954-12.380402%2010.588923-13.500076a531.877423%20531.877423%200%200%201%2083.527724-2.591247c6.941982%200.383888%2013.851974%201.727498%2020.570022%203.359024%208.477536%202.015414%209.405267%203.263052%209.853137%2012.124476%200.92773%2017.850812%201.855461%2035.701624%202.335321%2053.584427%200.543842%2019.866226%200.095972%2039.764443%200.831758%2059.63067%201.855461%2054.800074%201.567544%20109.664129%202.207359%20164.528184z%20m1134.806197%205.630364v117.437869c0%201.983424-0.063981%203.966847%200.03199%205.982262%200.415879%205.150503-1.983424%206.973973-6.878001%206.941982-12.028504-0.095972-24.025018%200-36.021531%200.159954-13.564058%200.127963-27.096125%200.063981-40.628192%201.535553-8.925406%201.023702-8.989387%200.351898-9.789155-8.509527-3.678931-40.660183-7.549806-81.320366-11.260728-122.04453-3.391014-37.525094-6.526103-75.082179-9.981099-112.639265-3.550968-38.740741-7.421843-77.38551-10.90883-116.09426-1.727498-19.386366-3.16708-38.772732-4.606661-58.159097-0.575833-8.445546%200.351898-9.949109%209.885127-10.716886%2016.571184-1.311619%2033.078387-3.550968%2049.777534-3.263051%2016.635165%200.319907%2033.302322-0.607823%2049.841515%202.559256%2014.011928%202.687219%2014.715723%203.486987%2015.547481%2018.458635%202.399303%2044.051198%201.663517%2088.230358%203.231061%20132.281556%201.599535%2046.89837%200.479861%2093.79674%201.759489%20146.069549zM1831.498213%20305.135c9.789155%200.575833%2017.498914%200.095972%2025.176683%201.791479%204.894578%201.119675%207.357862%203.327033%207.837723%208.573509%202.303331%2025.240664%204.798605%2050.51332%207.32587%2075.785975%202.015414%2020.50604%204.158791%2041.012081%206.238188%2061.518121l0.191944%201.183656c1.663517%2012.924244%201.279628%2013.276142-11.292718%2013.979937-11.196746%200.607823-22.361501%201.599535-33.558247%202.27134-7.357862%200.44787-9.693183%201.695507-10.90883-9.021378-4.190782-37.813011-9.053369-75.530049-13.692021-113.311069a1185.0316%201185.0316%200%200%200-4.286754-31.798759c-0.92773-5.982261%201.407591-9.277304%207.005964-9.757164%207.357862-0.671805%2014.715723-0.863749%2019.962198-1.215647z%20m-1133.398606%200.159954c7.549806%200.415879%2015.323547-0.159954%2022.937334%201.599535%204.350736%200.991712%206.558094%202.815182%206.973973%207.773741%200.92773%2011.83656%202.7512%2023.641129%203.870875%2035.477689%203.550968%2036.309448%206.909992%2072.650886%2010.237025%20108.992324%200.703795%207.901704%200.543842%208.061657-6.84601%208.605499-13.116188%200.959721-26.264367%201.919442-39.412546%202.463284-7.645778%200.351898-8.605499-0.575833-9.56522-8.381564-3.327033-26.744227-6.462122-53.520446-9.661192-80.296664-2.591247-22.073585-4.766615-44.14717-7.901704-66.156773-0.863749-6.078234%201.119675-7.74175%205.982262-8.733462%207.709759-1.567544%2015.451509-1.055693%2023.385203-1.343609z%20m399.147998%20100.002936c0%2023.001315%200.063981%2045.97064-0.031991%2069.003946%200%2010.332997-0.127963%2010.396978-10.396978%2010.269016a324.289753%20324.289753%200%200%201-36.981252-1.919443c-7.933694-0.991712-8.093648-0.735786-8.317583-9.149341-0.799768-28.119828-1.631526-56.239655-2.207359-84.359483-0.415879-19.034468-0.639814-38.004955-1.791479-57.039422-0.607823-9.821146-0.063981-9.917118%209.373276-10.045081%2013.915956-0.159954%2027.799921%200.479861%2041.619904%202.591247%208.317583%201.279628%208.701471%201.279628%208.733462%2010.49295%200.063981%2023.385204%200.063981%2046.770407%200.063981%2070.187602h-0.063981z%20m1135.38203%200.607824c0%2023.033306%200.063981%2046.034621-0.031991%2069.035936%200%209.661192-0.159954%209.725174-9.853137%209.661192a505.32514%20505.32514%200%200%201-38.132917-1.791479c-6.302168-0.479861-8.157629-3.135089-7.74175-8.861425%200.063981-0.799768%200-1.599535%200-2.399302-0.959721-44.403095-1.919442-88.7742-2.815182-133.177296-0.031991-2.367312-0.159954-4.734624-0.063982-7.133926%200.127963-8.957397%200.159954-9.181332%209.149341-9.117351%2012.380402%200.063981%2024.664832%200.703795%2037.013243%201.919442%2015.067621%201.503563%2012.412393%203.359024%2012.476375%2015.259566%200.063981%2022.169557%200.031991%2044.403095%200%2066.604643z%20m-1565.593%2054.000306c0.287916%2012.636328%200.287916%2012.604337-11.804569%2015.547481-8.221611%202.015414-16.443221%204.222773-24.728813%206.046243-7.069945%201.599535-8.317583%200.703795-9.53323-6.238187-8.445546-47.090314-16.8591-94.212619-25.240664-141.334924-1.695507-9.757164-1.247637-10.364988%208.349573-12.060495%2011.804569-2.079396%2023.577148-4.126801%2035.381717-5.950271%207.517815-1.183656%208.477536-0.767777%209.9811%207.517815%202.975135%2016.731138%205.790317%2033.526256%207.997675%2050.385357%203.423005%2026.680246%206.238187%2053.456464%209.309295%2080.168701%200.255926%201.951433%200.191944%203.966847%200.287916%205.91828z%20m1064.138735-136.696273c15.451509-2.527266%2031.030982-5.086522%2046.610454-7.549806%205.598373-0.863749%207.29388%202.655228%208.029666%207.645778%202.655228%2018.426645%205.982261%2036.725327%208.157629%2055.183962%203.19907%2026.744227%207.581797%2053.360492%208.413555%2080.328655%200.063981%202.7512%200.031991%205.566382%200.095972%208.317583%200.159954%204.286754-1.983424%206.494113-5.950271%207.421843-10.556932%202.367312-21.113864%204.734624-31.638805%207.261889-5.054531%201.215647-6.750038-0.92773-7.581796-5.854298-3.16708-18.746552-6.81402-37.397131-10.045081-56.079702-5.47041-30.775056-10.780867-61.582103-16.091323-92.38915-0.127963-1.119675%200-2.303331%200-4.286754z%20m-710.64147%20108.032603c-0.44787%2016.37924%200.543842%2030.647093-1.695507%2044.914947-0.671805%204.510689-1.983424%207.421843-6.846011%207.837722-10.428969%200.863749-20.825947%201.695507-31.190935%202.7512-5.02254%200.543842-6.430131-1.631526-7.261889-6.558094-2.335321-14.55577-1.919442-29.303484-3.327033-43.923234-2.655228-27.607976-3.774903-55.407897-5.566383-83.111846-0.44787-6.750038-1.119675-13.436095-1.663516-20.186134-0.287916-3.774903%201.215647-5.886289%205.246475-6.046242%2013.500077-0.543842%2026.936172-3.007126%2040.50023-2.527266%207.933694%200.287916%208.605499%200.799768%209.181331%208.797443%200.351898%205.534392%200.255926%2011.132765%200.383889%2016.699147l2.239349%2081.352357z%20m1134.902169-15.867388c0%2019.066459%200.223935%2038.132918-0.031991%2057.199376-0.159954%209.917118-1.279628%2010.780867-10.652904%2011.644616-9.277304%200.863749-18.490626%201.567544-27.735939%202.559256-5.214485%200.543842-7.645778-0.991712-7.965685-6.973973-1.34361-25.336637-3.16708-50.673273-4.926568-75.977919-1.3756-20.985901-2.943145-41.939811-4.414717-62.893722-0.159954-2.399303-0.031991-4.798605-0.191944-7.165917-0.223935-4.190782%201.055693-6.654066%205.758326-6.81402%2013.116188-0.44787%2026.136404-2.975135%2039.348564-2.495274%208.061657%200.287916%208.18962%200.415879%208.797444%208.797443%201.951433%2027.32006%202.143377%2054.704102%202.015414%2082.120134zM628.295894%20756.171918c16.571184%2018.234701%2017.402942%2039.828425%2011.932532%2062.413861-5.502401%2022.585436-18.042756%2041.204025-33.23834%2057.903171-25.49659%2027.895893-56.303637%2048.497905-89.062116%2065.99682-56.399609%2030.135242-116.190232%2050.161422-178.572103%2061.997982-44.882956%208.477536-90.053828%2015.00364-135.704561%2017.498914-13.915956%200.767777-27.799921%201.407591-41.715876%201.311619-10.077071%200-20.186133%200.287916-30.231214-0.063981-8.541518-0.319907-9.789155-1.791479-10.49295-10.716886-2.591247-32.022693-4.798605-64.077378-7.645778-96.100071-3.327033-37.109215-7.229899-74.18644-10.812858-111.295654-2.623238-26.8402-4.894578-53.744381-7.773741-80.520599-3.327033-31.542833-7.069945-63.021684-10.716885-94.564517-3.327033-29.111539-6.526103-58.28706-10.045081-87.430591-3.934856-32.278619-7.997676-64.493257-12.31642-96.707894a8228.968456%208228.968456%200%200%200-13.212161-92.996973%205984.500754%205984.500754%200%200%200-24.312934-152.627642%203243.825263%203243.825263%200%200%200-23.67312-123.740038c-1.151665-5.502401%200.511851-7.709759%205.342448-9.725174C52.335283%2047.609843%2098.465876%2028.063524%20144.724432%208.77313c8.605499-3.582959%2017.434933-6.590085%2026.584274-8.285592%206.334159-1.183656%207.965685%200.127963%207.773741%206.494113-0.479861%2016.283268%200.191944%2032.630517-1.407591%2048.849803a161.393095%20161.393095%200%200%200-0.639814%2013.084197c-0.735786%2058.383032-1.439582%20116.798056%200.095972%20175.213079%201.34361%2051.185124%204.030829%20102.338258%207.005964%20153.491392%202.335321%2040.372267%205.694345%2080.744534%209.149341%20121.052819%203.391014%2039.508518%207.517815%2078.953054%2011.38869%20118.461572%200.735786%207.517815%201.407591%208.221611%209.949108%207.069945a381.329176%20381.329176%200%200%201%2050.833227-4.190782c52.880632-0.127963%20104.897514%207.133927%20156.338564%2019.322384%2045.010919%2010.684895%2088.806191%2024.920757%20130.777993%2044.818975%2020.793957%209.853136%2040.692174%2021.241827%2058.830902%2035.701624%206.174206%204.862587%2011.676606%2010.46096%2016.891091%2016.315259z%20m1126.840512-9.597211c20.47405%2017.946784%2027.927883%2039.924397%2022.105576%2067.116494-4.830596%2022.425483-15.771416%2041.268006-30.359177%2058.127107-23.417194%2027.096125-51.856929%2047.698138-82.631985%2064.909136-60.334465%2033.782182-124.603787%2055.727804-192.168151%2068.396122a1151.089465%201151.089465%200%200%201-111.455609%2015.547481c-21.177845%201.82347-42.451662%204.09481-66.220754%202.623238h-27.76793c-5.406429%200-8.477536-1.695507-8.925406-8.125638-2.047405-28.087837-4.414717-56.143683-6.941983-84.19953-2.687219-29.623391-5.662354-59.246781-8.477536-88.870172-2.559256-27.224088-4.926568-54.512157-7.709759-81.736245-2.559256-25.656544-5.502401-51.249106-8.285592-76.873659-2.591247-24.057008-5.086522-48.114017-7.933695-72.139035-3.423005-29.111539-7.037955-58.223079-10.652904-87.334618-3.391014-27.160107-6.750038-54.288222-10.364987-81.416338a6133.577429%206133.577429%200%200%200-12.156467-87.142675c-5.694345-37.653057-11.804569-75.178151-17.818822-112.767227a3259.14881%203259.14881%200%200%200-29.111539-158.993792c-0.44787-2.335321-0.671805-4.734624-1.3756-7.005964-1.663517-5.118512-0.063981-7.837722%204.958559-9.821146C1191.012355%2047.641834%201238.61452%2024.448575%201288.2321%206.149893c6.494113-2.431293%2013.052207-5.150503%2020.058171-5.854299%206.302168-0.639814%207.901704%200.383888%207.29388%207.101936-3.327033%2036.43741-1.407591%2073.066765-3.135089%20109.536166-1.407591%2029.751354-1.247637%2059.598679%200.255926%2089.382023%200.351898%207.549806%200.639814%2015.131602%200.575832%2022.649418-0.383888%2035.765606%201.503563%2071.499221%203.327033%20107.200845%202.335321%2047.186286%205.758326%2094.276601%209.245313%20141.398906%202.527266%2034.006117%205.822308%2067.948253%209.021379%20101.922379%201.695507%2018.586598%203.518977%2037.141206%205.822308%2055.631832%201.247637%2010.205034%201.759489%2010.301006%2011.772578%208.957396%2017.658868-2.399303%2035.349726-4.350736%2053.200539-4.09481%2062.637796%200.799768%20124.027954%2010.684895%20184.266447%2027.863902%2040.788146%2011.580634%2080.488608%2026.040432%20117.981712%2046.290547a253.55831%20253.55831%200%200%201%2047.218277%2032.438573zM308.676783%20922.811488c23.161269-11.068783%20135.608589-98.947243%20144.533995-113.279078-54.576139-23.513166-109.344222-45.362816-168.239105-63.24562l23.70511%20176.524698z%20m1277.196815-107.520752c2.879163-3.103098%202.559256-5.502401-1.343609-7.229899-7.773741-3.550968-15.4835-7.325871-23.353213-10.556932-42.003793-17.179007-84.19953-33.814173-127.482951-47.37823-3.774903-1.151665-7.645778-3.774903-12.476374-1.535554l23.321222%20173.45359c3.454996%200.767777%204.798605-0.831758%206.33416-1.919442%2039.316574-28.855614%2078.889073-57.35933%20116.638102-88.390312%206.36615-5.182494%2012.668318-10.396978%2018.362663-16.443221z%22%2F%3E%3C%2Fsvg%3E",
    "up": "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20fill%3D%22%23FB7299%22%20d%3D%22M1.33334%205.16669C1.33334%203.78597%202.45263%202.66669%203.83334%202.66669H12.1667C13.5474%202.66669%2014.6667%203.78597%2014.6667%205.16669V10.8334C14.6667%2012.2141%2013.5474%2013.3334%2012.1667%2013.3334H3.83334C2.45263%2013.3334%201.33334%2012.2141%201.33334%2010.8334V5.16669ZM3.83334%203.66669C3.00492%203.66669%202.33334%204.33826%202.33334%205.16669V10.8334C2.33334%2011.6618%203.00492%2012.3334%203.83334%2012.3334H12.1667C12.9951%2012.3334%2013.6667%2011.6618%2013.6667%2010.8334V5.16669C13.6667%204.33826%2012.9951%203.66669%2012.1667%203.66669H3.83334ZM4.33334%205.50002C4.60949%205.50002%204.83334%205.72388%204.83334%206.00002V8.50002C4.83334%209.05231%205.28106%209.50002%205.83334%209.50002C6.38563%209.50002%206.83334%209.05231%206.83334%208.50002V6.00002C6.83334%205.72388%207.0572%205.50002%207.33334%205.50002C7.60949%205.50002%207.83334%205.72388%207.83334%206.00002V8.50002C7.83334%209.60459%206.93791%2010.5%205.83334%2010.5C4.72877%2010.5%203.83334%209.60459%203.83334%208.50002V6.00002C3.83334%205.72388%204.0572%205.50002%204.33334%205.50002ZM9.00001%205.50002C8.72387%205.50002%208.50001%205.72388%208.50001%206.00002V10C8.50001%2010.2762%208.72387%2010.5%209.00001%2010.5C9.27615%2010.5%209.50001%2010.2762%209.50001%2010V9.33335H10.5833C11.6419%209.33335%2012.5%208.47523%2012.5%207.41669C12.5%206.35814%2011.6419%205.50002%2010.5833%205.50002H9.00001ZM10.5833%208.33335H9.50001V6.50002H10.5833C11.0896%206.50002%2011.5%206.91043%2011.5%207.41669C11.5%207.92295%2011.0896%208.33335%2010.5833%208.33335Z%22%2F%3E%3C%2Fsvg%3E",
    "like": "data:image/svg+xml,%3Csvg%20width%3D%2236%22%20height%3D%2236%22%20viewBox%3D%220%200%2036%2036%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M9.77234%2030.8573V11.7471H7.54573C5.50932%2011.7471%203.85742%2013.3931%203.85742%2015.425V27.1794C3.85742%2029.2112%205.50932%2030.8573%207.54573%2030.8573H9.77234ZM11.9902%2030.8573V11.7054C14.9897%2010.627%2016.6942%207.8853%2017.1055%203.33591C17.2666%201.55463%2018.9633%200.814421%2020.5803%201.59505C22.1847%202.36964%2023.243%204.32583%2023.243%206.93947C23.243%208.50265%2023.0478%2010.1054%2022.6582%2011.7471H29.7324C31.7739%2011.7471%2033.4289%2013.402%2033.4289%2015.4435C33.4289%2015.7416%2033.3928%2016.0386%2033.3215%2016.328L30.9883%2025.7957C30.2558%2028.7683%2027.5894%2030.8573%2024.528%2030.8573H11.9911H11.9902Z%22%20fill%3D%22%23405e65%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
    "coin": "data:image/svg+xml,%3Csvg%20width%3D%2228%22%20height%3D%2228%22%20viewBox%3D%220%200%2028%2028%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M14.045%2025.5454C7.69377%2025.5454%202.54504%2020.3967%202.54504%2014.0454C2.54504%207.69413%207.69377%202.54541%2014.045%202.54541C20.3963%202.54541%2025.545%207.69413%2025.545%2014.0454C25.545%2017.0954%2024.3334%2020.0205%2022.1768%2022.1771C20.0201%2024.3338%2017.095%2025.5454%2014.045%2025.5454ZM9.66202%206.81624H18.2761C18.825%206.81624%2019.27%207.22183%2019.27%207.72216C19.27%208.22248%2018.825%208.62807%2018.2761%208.62807H14.95V10.2903C17.989%2010.4444%2020.3766%2012.9487%2020.3855%2015.9916V17.1995C20.3854%2017.6997%2019.9799%2018.1052%2019.4796%2018.1052C18.9793%2018.1052%2018.5738%2017.6997%2018.5737%2017.1995V15.9916C18.5667%2013.9478%2016.9882%2012.2535%2014.95%2012.1022V20.5574C14.95%2021.0577%2014.5444%2021.4633%2014.0441%2021.4633C13.5437%2021.4633%2013.1382%2021.0577%2013.1382%2020.5574V12.1022C11.1%2012.2535%209.52148%2013.9478%209.51448%2015.9916V17.1995C9.5144%2017.6997%209.10883%2018.1052%208.60856%2018.1052C8.1083%2018.1052%207.70273%2017.6997%207.70265%2017.1995V15.9916C7.71158%2012.9487%2010.0992%2010.4444%2013.1382%2010.2903V8.62807H9.66202C9.11309%208.62807%208.66809%208.22248%208.66809%207.72216C8.66809%207.22183%209.11309%206.81624%209.66202%206.81624Z%22%20fill%3D%22%23405e65%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E",
    "favorite": "data:image/svg+xml,%3Csvg%20width%3D%2228%22%20height%3D%2228%22%20viewBox%3D%220%200%2028%2028%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20clip-rule%3D%22evenodd%22%20d%3D%22M19.8071%209.26152C18.7438%209.09915%2017.7624%208.36846%2017.3534%207.39421L15.4723%203.4972C14.8998%202.1982%2013.1004%202.1982%2012.4461%203.4972L10.6468%207.39421C10.1561%208.36846%209.25639%209.09915%208.19315%209.26152L3.94016%209.91102C2.63155%2010.0734%202.05904%2011.6972%203.04049%2012.6714L6.23023%2015.9189C6.96632%2016.6496%207.29348%2017.705%207.1299%2018.7605L6.39381%2023.307C6.14844%2024.6872%207.62063%2025.6614%208.84745%2025.0119L12.4461%2023.0634C13.4276%2022.4951%2014.6544%2022.4951%2015.6359%2023.0634L19.2345%2025.0119C20.4614%2025.6614%2021.8518%2024.6872%2021.6882%2023.307L20.8703%2018.7605C20.7051%2017.705%2021.0339%2016.6496%2021.77%2015.9189L24.9597%2012.6714C25.9412%2011.6972%2025.3687%2010.0734%2024.06%209.91102L19.8071%209.26152Z%22%20fill%3D%22%23405e65%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E"
  };

  // src/ui/poster-styles.ts
  var posterStyles = `
.bsp-poster.bsp-default-poster{all:initial;box-sizing:border-box;position:relative;isolation:isolate;display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:144px 547.2px auto minmax(0,1fr) 100.8px;flex:none;width:1080px;height:1440px;overflow:hidden;background:#e8eded;color:#203039;font-family:"PingFang SC","Microsoft YaHei",sans-serif;transform-origin:top left;-webkit-text-stroke:0;text-shadow:none}
.bsp-default-poster::after{display:none}
.bsp-default-poster *{box-sizing:border-box}
.bsp-d-mast{display:flex;justify-content:space-between;align-items:center;padding:32.4px 64.8px;gap:21.6px;min-height:0}
.bsp-d-brand{width:151.2px;height:75.6px;object-fit:contain}
.bsp-d-ids{display:grid;gap:6.48px;text-align:right;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:25.92px;letter-spacing:.3px;white-space:nowrap}
.bsp-d-ids b{font-weight:inherit}
.bsp-d-cover{display:block;width:950.4px;height:547.2px;object-fit:contain;object-position:center;justify-self:center}
.bsp-d-editorial{min-height:0;padding:43.2px 64.8px 32.4px}
.bsp-d-title-space{min-height:0}
.bsp-d-title{margin:0;font-family:"Songti SC","STSong","SimSun",serif;font-weight:600;letter-spacing:0;line-height:1.38;overflow-wrap:anywhere;word-break:normal;color:inherit}
.bsp-d-footer{min-height:0;margin:0 64.8px;padding:43.2px 0 21.6px;border-top:1px solid #20303933;display:flex;gap:21.6px;align-items:center}
.bsp-d-signature{min-width:0;flex:1}
.bsp-d-author{display:flex;gap:15.12px;align-items:center;min-width:0;line-height:1.4;font-size:49.68px;font-weight:600;white-space:nowrap}
.bsp-d-up{width:66.96px;height:66.96px;flex:0 0 66.96px}
.bsp-d-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bsp-d-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16.2px;align-items:center;margin-top:30.24px}
.bsp-d-stat{min-width:0;display:flex;gap:7.56px;align-items:center;font-size:36.72px;white-space:nowrap;font-variant-numeric:tabular-nums}
.bsp-d-stat-value{min-width:0;overflow:hidden;text-overflow:ellipsis}
.bsp-d-stat img,.bsp-d-stat svg{width:54px;height:54px;min-width:54px;max-width:54px;flex:0 0 54px}
.bsp-d-qr{width:183.6px;flex:0 0 183.6px;text-align:center}
.bsp-d-qr-frame{padding:12.96px;border-radius:10.8px;background:#fff}
.bsp-d-qr-image{width:157.68px;height:157.68px;display:block}
.bsp-d-qr-caption{margin-top:10.8px;font-size:27px;line-height:1.4}
.bsp-d-link-footer{min-width:0;padding:10.8px 64.8px 32.4px;display:flex;align-items:center}
.bsp-d-address{min-width:0;width:100%}
.bsp-d-address-icon{display:none}
.bsp-d-link{display:block;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:27px;line-height:1.4;overflow-wrap:anywhere;word-break:break-all;white-space:normal}
`;

  // src/ui/posters.ts
  function image(className, src, alt = "") {
    return Object.assign(element("img", className), { src, alt });
  }
  function svg(className, markup) {
    const parsed = new DOMParser().parseFromString(markup, "image/svg+xml").documentElement;
    parsed.setAttribute("class", className);
    return document.importNode(parsed, true);
  }
  var appearances = /* @__PURE__ */ new WeakMap();
  async function deriveCoverAppearance(src) {
    const cover = image("", src);
    await cover.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 240;
    canvas.height = 320;
    const context = canvas.getContext("2d");
    context.filter = "blur(18px)";
    const scale = Math.max(280 / cover.naturalWidth, 360 / cover.naturalHeight);
    context.drawImage(cover, (240 - cover.naturalWidth * scale) / 2, (320 - cover.naturalHeight * scale) / 2, cover.naturalWidth * scale, cover.naturalHeight * scale);
    context.filter = "none";
    const pixels = context.getImageData(0, 0, 240, 320).data;
    const average = [0, 0, 0];
    for (let i = 0; i < pixels.length; i += 4) {
      average.forEach((_, channel) => {
        average[channel] += pixels[i + channel] / (240 * 320);
      });
    }
    const ink = `rgb(${average.map((value, channel) => Math.round(value * 0.2 + [12, 16, 20][channel] * 0.8)).join(",")})`;
    const light = context.createLinearGradient(0, 0, 240, 320);
    light.addColorStop(0, "#ffffffc7");
    light.addColorStop(0.52, "#ffffff88");
    light.addColorStop(1, "#ffffffa8");
    context.fillStyle = light;
    context.fillRect(0, 0, 240, 320);
    return { background: canvas.toDataURL(), ink };
  }
  function coverAppearance(snapshot) {
    let result = appearances.get(snapshot);
    if (!result) {
      result = deriveCoverAppearance(snapshot.coverDataUrl);
      appearances.set(snapshot, result);
      void result.catch(() => appearances.delete(snapshot));
    }
    return result;
  }
  function ellipsizeToHeight(node, maxHeight) {
    if (node.getBoundingClientRect().height <= maxHeight + 1) return;
    const characters = Array.from(node.textContent ?? "");
    let low = 0;
    let high = characters.length;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      node.textContent = characters.slice(0, middle).join("") + "\u2026";
      if (node.getBoundingClientRect().height <= maxHeight + 1) low = middle;
      else high = middle - 1;
    }
    node.textContent = characters.slice(0, low).join("") + "\u2026";
  }
  async function fitContent(poster, title) {
    const host = element("div");
    Object.assign(host.style, { position: "fixed", left: "-12000px", top: "0", visibility: "hidden", width: "1080px" });
    host.append(poster);
    document.body.append(host);
    try {
      await document.fonts.ready;
      await Promise.all(Array.from(poster.querySelectorAll("img"), (img) => img.decode()));
      const probe = title.cloneNode(true);
      Object.assign(probe.style, { position: "absolute", width: `${title.getBoundingClientRect().width}px`, visibility: "hidden" });
      title.parentElement.append(probe);
      try {
        const editorialStyle = getComputedStyle(poster.querySelector(".bsp-d-editorial"));
        const available = poster.clientHeight * 0.26 - parseFloat(editorialStyle.paddingTop) - parseFloat(editorialStyle.paddingBottom);
        for (const size of [64.8, 60.48, 56.16, 51.84, 47.52]) {
          probe.style.fontSize = `${size}px`;
          if (probe.scrollHeight <= available + 1) break;
        }
        ellipsizeToHeight(probe, available);
        title.style.fontSize = probe.style.fontSize;
        title.textContent = probe.textContent;
      } finally {
        probe.remove();
      }
      for (const value of poster.querySelectorAll(".bsp-d-stat-value")) {
        for (const size of [36.72, 34, 31, 28, 25]) {
          value.style.fontSize = `${size}px`;
          if (value.scrollWidth <= value.clientWidth + 1) break;
        }
      }
    } finally {
      poster.remove();
      host.remove();
    }
  }
  async function createPoster(model, snapshot) {
    if (model.coverUnavailable) throw new Error("\u5C01\u9762\u6682\u65F6\u65E0\u6CD5\u52A0\u8F7D");
    const poster = element("article", "bsp-poster bsp-default-poster");
    const appearance = await coverAppearance(snapshot);
    poster.style.backgroundImage = `url("${appearance.background}")`;
    poster.style.backgroundSize = "100% 100%";
    poster.style.color = appearance.ink;
    poster.setAttribute("aria-label", `${model.title} \u5206\u4EAB\u6D77\u62A5`);
    const style = element("style", "", posterStyles);
    const mast = element("header", "bsp-d-mast");
    mast.append(image("bsp-d-brand", posterAssets.brand, "\u54D4\u54E9\u54D4\u54E9"));
    const cover = image("bsp-d-cover", model.coverDataUrl, "\u539F\u89C6\u9891\u5B8C\u6574\u5C01\u9762");
    const editorial = element("div", "bsp-d-editorial");
    const titleSpace = element("div", "bsp-d-title-space");
    const title = element("h4", "bsp-d-title", model.title);
    titleSpace.append(title);
    editorial.append(titleSpace);
    const footer = element("footer", "bsp-d-footer");
    const signature = element("div", "bsp-d-signature");
    const author = element("div", "bsp-d-author");
    const name = element("span", "bsp-d-name", model.uploader);
    author.append(image("bsp-d-up", posterAssets.up, "UP \u4E3B"), name);
    const stats = element("div", "bsp-d-stats");
    const statIcons = [
      svg("", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/></svg>'),
      image("", posterAssets.like),
      image("", posterAssets.coin),
      image("", posterAssets.favorite)
    ];
    model.stats.forEach((statistic2, index) => {
      const cell = element("span", "bsp-d-stat");
      cell.setAttribute("aria-label", `${statistic2.label} ${statistic2.value}`);
      cell.append(statIcons[index], element("span", "bsp-d-stat-value", statistic2.value));
      stats.append(cell);
    });
    const ids = element("div", "bsp-d-ids");
    const bv = element("span");
    bv.append(element("b", "", "BV"), document.createTextNode(model.bvid.slice(2)));
    const av = element("span");
    av.append(element("b", "", "av"), document.createTextNode(String(model.aid)));
    ids.append(bv, av);
    mast.append(ids);
    signature.append(author, stats);
    const qr = element("div", "bsp-d-qr");
    const frame = element("div", "bsp-d-qr-frame");
    const qrData = await import_qrcode.default.toDataURL(model.shareTarget, { width: 564, margin: 4, errorCorrectionLevel: "M", color: { dark: "#000000", light: "#ffffff" } });
    frame.append(image("bsp-d-qr-image", qrData, `\u4E8C\u7EF4\u7801\uFF1A${model.shareTarget}`));
    qr.append(frame, element("div", "bsp-d-qr-caption", "\u626B\u7801\u89C2\u770B"));
    footer.append(signature, qr);
    const linkFooter = element("div", "bsp-d-link-footer");
    const address = element("div", "bsp-d-address");
    address.append(svg("bsp-d-address-icon", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M4.3 7.5h15.4M4.3 16.5h15.4"/></svg>'), element("span", "bsp-d-link", model.shareTarget));
    linkFooter.append(address);
    poster.append(style, mast, cover, editorial, footer, linkFooter);
    await fitContent(poster, title);
    return poster;
  }
  function exportPosterPng(poster) {
    return toPng(poster, { width: 1080, height: 1440, pixelRatio: 1, cacheBust: false, style: { transform: "none" } });
  }

  // src/ui/panel.ts
  var SharePanel = class {
    backdrop = element("div", "bsp-backdrop");
    panel = element("section", "bsp-panel");
    previewPane = element("div", "bsp-preview-pane");
    controls = element("div", "bsp-controls");
    openedIdentity = readPageIdentity();
    capture = null;
    snapshot = null;
    model = null;
    poster = null;
    options = createDefaultShareOptions();
    shareTarget = null;
    closed = false;
    loading = false;
    updating = false;
    exporting = false;
    exportButtons = [];
    statusTimer = 0;
    previewObserver = new ResizeObserver(() => this.fitPoster());
    onClosed;
    setAppearance(appearance) {
      this.backdrop.classList.toggle("bsp-appearance-dark", appearance === "dark");
    }
    constructor(onClosed) {
      this.onClosed = onClosed;
      this.backdrop.setAttribute("role", "presentation");
      this.panel.setAttribute("role", "dialog");
      this.panel.setAttribute("aria-modal", "true");
      this.panel.setAttribute("aria-labelledby", "bsp-dialog-title");
      this.panel.tabIndex = -1;
      const heading = element("header", "bsp-panel-head");
      const title = element("h2", "", "\u5206\u4EAB\u6D77\u62A5");
      title.id = "bsp-dialog-title";
      const close = element("button", "bsp-close");
      close.append(createIcon("close"));
      close.type = "button";
      close.setAttribute("aria-label", "\u5173\u95ED\u5206\u4EAB\u9762\u677F");
      close.addEventListener("click", () => this.close(true));
      heading.append(title, close);
      const workspace = element("div", "bsp-workspace");
      workspace.append(this.previewPane, this.controls);
      this.panel.append(heading, workspace);
      this.backdrop.append(this.panel);
      this.backdrop.addEventListener("click", (event) => {
        if (event.target === this.backdrop) this.close(true);
      });
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onFocusIn = this.onFocusIn.bind(this);
      this.previewPane.setAttribute("aria-label", "\u6D77\u62A5\u9884\u89C8");
    }
    open() {
      this.options = createPanelShareOptions(loadRememberedPreferences());
      document.body.append(this.backdrop);
      this.previewObserver.observe(this.previewPane);
      document.addEventListener("keydown", this.onKeyDown, true);
      document.addEventListener("focusin", this.onFocusIn, true);
      this.renderLoading();
      this.panel.focus();
      void this.captureThenLoad();
    }
    focus() {
      this.panel.focus();
    }
    matchesCurrentPage() {
      const identity = this.capture ?? this.openedIdentity;
      const current = readPageIdentity();
      return Boolean(current && identity && current.bvid.toUpperCase() === identity.bvid.toUpperCase() && current.partNumber === identity.partNumber);
    }
    ensureCurrentContext() {
      if (this.closed) return false;
      if (this.matchesCurrentPage()) return true;
      this.close(false);
      return false;
    }
    close(restore) {
      if (this.closed) return;
      this.closed = true;
      clearTimeout(this.statusTimer);
      this.previewObserver.disconnect();
      document.removeEventListener("keydown", this.onKeyDown, true);
      document.removeEventListener("focusin", this.onFocusIn, true);
      this.backdrop.inert = true;
      this.backdrop.setAttribute("aria-hidden", "true");
      this.backdrop.classList.add("bsp-backdrop-closing");
      this.panel.classList.add("bsp-panel-closing");
      if (restore && this.capture) restorePlayback(this.capture);
      this.onClosed();
      if (restore) document.getElementById("bsp-entry")?.focus({ preventScroll: true });
      window.setTimeout(() => this.backdrop.remove(), motionDelay(MOTION.fast));
    }
    onFocusIn(event) {
      if (!this.closed && event.target instanceof Node && !this.panel.contains(event.target)) this.panel.focus();
    }
    onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close(true);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(this.panel.querySelectorAll("button,input,textarea,a[href],[tabindex]")).filter((node) => node.tabIndex >= 0 && !node.matches(":disabled") && node.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        this.panel.focus();
        return;
      }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === this.panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    previewState(message, retry) {
      const state = element("div", "bsp-loading-card");
      if (!retry) state.append(element("div", "bsp-spinner"));
      state.append(element("p", "", message));
      if (retry) state.append(retry);
      return state;
    }
    renderLoading() {
      this.previewPane.replaceChildren(this.previewState("\u6B63\u5728\u751F\u6210\u6D77\u62A5"));
      this.controls.replaceChildren();
    }
    async captureThenLoad() {
      if (!this.ensureCurrentContext()) return;
      try {
        this.capture = captureAndPausePlayback();
      } catch (error) {
        this.renderError(error, true);
        return;
      }
      await this.loadSnapshot();
    }
    async loadSnapshot() {
      if (!this.ensureCurrentContext() || !this.capture || this.loading) return;
      this.loading = true;
      try {
        const snapshot = await fetchGenerationSnapshot(this.capture);
        const shareTarget = buildCanonicalShareTarget(snapshot.bvid, snapshot, this.options);
        const model = snapshot.coverUnavailable ? null : buildSharePoster(snapshot, shareTarget);
        const poster = model ? await createPoster(model, snapshot) : null;
        if (!this.ensureCurrentContext()) return;
        this.snapshot = snapshot;
        this.model = model;
        this.poster = poster;
        this.shareTarget = shareTarget;
        this.renderReady(poster, shareTarget);
      } catch (error) {
        if (this.ensureCurrentContext()) this.renderError(error, false);
      } finally {
        this.loading = false;
      }
    }
    renderReady(poster, shareTarget) {
      const active = document.activeElement;
      const focusName = active instanceof HTMLElement && this.panel.contains(active) ? active.getAttribute("aria-label") ?? active.textContent : null;
      if (!poster) {
        const retry = element("button", "bsp-button", "\u91CD\u8BD5");
        retry.type = "button";
        retry.addEventListener("click", () => {
          this.renderLoading();
          void this.loadSnapshot();
        });
        this.previewPane.replaceChildren(this.previewState("\u5C01\u9762\u6682\u65F6\u65E0\u6CD5\u52A0\u8F7D", retry));
      } else if (!this.previewPane.contains(poster)) {
        const frame = element("div", "bsp-preview-frame");
        frame.append(poster);
        this.previewPane.replaceChildren(frame);
      }
      this.fitPoster();
      this.updating = false;
      this.exportButtons = [];
      clearTimeout(this.statusTimer);
      if (!this.snapshot) return;
      const snapshot = this.snapshot;
      const shareText = buildShareText(snapshot, shareTarget, { ...this.options, markdownText: false });
      const markdownText = buildShareText(snapshot, shareTarget, { ...this.options, markdownText: true });
      const status = element("p", "bsp-status");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      const copy = this.actionButton("copy", "\u590D\u5236\u6D77\u62A5", "\u590D\u5236\u6D77\u62A5", true, () => void this.copyPoster(status));
      const download = this.actionButton("download", "", "\u4E0B\u8F7D\u6D77\u62A5 PNG", false, () => void this.download(status));
      download.classList.add("bsp-download");
      const combined = this.actionButton("combined", "\u7EC4\u5408\u590D\u5236", "\u7EC4\u5408\u590D\u5236", false, () => void this.copyCombined(shareText, status));
      combined.title = "\u540C\u65F6\u63D0\u4F9B\u6D77\u62A5\u4E0E\u6587\u6848\uFF0C\u63A5\u6536\u65B9\u53EF\u80FD\u53EA\u7C98\u8D34\u5176\u4E2D\u4E00\u79CD";
      const copyText2 = this.actionButton(null, "\u590D\u5236\u6587\u6848", "\u590D\u5236\u6587\u6848", false, () => void this.copyShareText(copyText2, shareText, status));
      const copyMarkdown = this.actionButton(null, "\u590D\u5236 Markdown", "\u590D\u5236 Markdown", false, () => void this.copyShareText(copyMarkdown, markdownText, status, "Markdown"));
      this.exportButtons.push(copy, download, copyText2, copyMarkdown, combined);
      for (const button of [copy, download, combined]) button.disabled = !poster;
      const textSection = this.renderTextPreview(shareText);
      const textHeading = element("div", "bsp-section-heading");
      const textActions = element("div", "bsp-text-copy-actions");
      textActions.append(copyText2, copyMarkdown);
      textHeading.append(element("h3", "", "\u5206\u4EAB\u6587\u6848"), textActions);
      textSection.prepend(textHeading);
      const detail = element("input");
      detail.type = "checkbox";
      detail.checked = this.options.detailedText;
      detail.setAttribute("aria-label", "\u8BE6\u7EC6\u4FE1\u606F");
      detail.addEventListener("change", () => this.applyOptions({ ...this.options, detailedText: detail.checked }));
      const detailLabel = element("label");
      detailLabel.append(detail, document.createTextNode("\u8BE6\u7EC6\u4FE1\u606F"));
      const textOptions = element("div", "bsp-text-options");
      textOptions.append(detailLabel);
      textSection.append(textOptions);
      const actions = element("div", "bsp-actions");
      actions.append(copy, combined);
      const actionGroup = element("div", "bsp-action-group");
      actionGroup.append(actions, status);
      const downloadArea = element("div", "bsp-preview-download");
      downloadArea.append(download);
      this.previewPane.querySelector(".bsp-preview-download")?.remove();
      this.previewPane.append(downloadArea);
      this.controls.replaceChildren(this.renderShareOptions(), textSection, actionGroup);
      if (focusName) {
        Array.from(this.panel.querySelectorAll("button,input,textarea,[tabindex]")).find((node) => (node.getAttribute("aria-label") ?? node.textContent) === focusName)?.focus({ preventScroll: true });
      }
    }
    renderTextPreview(shareText) {
      const lines = shareText.split("\n");
      const link = lines.pop() ?? "";
      const body = lines.join("\n");
      const card = element("div", "bsp-text-card");
      const content = element("div", "bsp-text-content");
      content.setAttribute("aria-label", "\u5206\u4EAB\u6587\u6848\u9884\u89C8");
      content.tabIndex = 0;
      content.append(
        element("span", "bsp-text-card-body", body + (lines.length ? "\n" : "")),
        element("span", "bsp-text-card-link", link)
      );
      card.append(content);
      return card;
    }
    actionButton(iconName, label, tip, primary, onClick) {
      const button = element("button", primary ? "bsp-action bsp-action-primary" : "bsp-action", label);
      button.type = "button";
      button.title = tip;
      button.setAttribute("aria-label", tip);
      if (iconName) button.prepend(createIcon(iconName));
      button.addEventListener("click", onClick);
      return button;
    }
    clearStatus(status) {
      clearTimeout(this.statusTimer);
      status.textContent = "";
      status.classList.remove("is-show", "is-error");
    }
    showStatus(message, error = false) {
      const status = this.controls.querySelector(".bsp-status");
      if (!status) return;
      clearTimeout(this.statusTimer);
      status.textContent = message;
      status.classList.toggle("is-error", error);
      status.classList.add("is-show");
      const delay = statusDismissDelay(error);
      if (delay !== null) this.statusTimer = window.setTimeout(() => status.classList.remove("is-show"), delay);
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
        this.optionToggle("list", "\u6807\u8BB0\u5F53\u524D\u5206P", this.options.partShare, !canEnablePartShare(snapshot) || this.updating, (checked) => {
          void checked;
          this.applyOptions(togglePartShare(this.options, snapshot));
        }),
        this.optionToggle("clock", "\u6807\u8BB0\u5F53\u524D\u65F6\u95F4", this.options.timestampShare, !canEnableTimestampShare(snapshot) || this.updating, (checked) => {
          void checked;
          this.applyOptions(toggleTimestampShare(this.options, snapshot));
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
    fitPoster() {
      for (const frame of this.previewPane.querySelectorAll(".bsp-preview-frame")) {
        const poster = frame.querySelector(".bsp-poster");
        if (poster) poster.style.transform = `scale(${Math.min(1, frame.clientWidth / 1080)})`;
      }
    }
    applyOptions(next) {
      if (!this.ensureCurrentContext() || !this.snapshot || this.updating || this.exporting) return;
      const previous = this.options;
      const targetChanged = previous.partShare !== next.partShare || previous.timestampShare !== next.timestampShare;
      const textChanged = previous.detailedText !== next.detailedText || previous.markdownText !== next.markdownText;
      this.options = next;
      if (textChanged) this.persistPreferences();
      if (targetChanged) {
        void this.rebuildPosterForOptions();
        return;
      }
      if (textChanged && this.shareTarget) {
        this.renderReady(this.poster, this.shareTarget);
      }
    }
    persistPreferences() {
      if (typeof GM_setValue !== "function") return;
      GM_setValue("bsp-panel-preferences", {
        detailedText: this.options.detailedText
      });
    }
    async rebuildPosterForOptions() {
      if (!this.snapshot || this.updating) return;
      this.updating = true;
      this.setExportButtonsDisabled(true);
      this.showUpdatingOverlay();
      try {
        const shareTarget = buildCanonicalShareTarget(this.snapshot.bvid, this.snapshot, this.options);
        const model = this.snapshot.coverUnavailable ? null : buildSharePoster(this.snapshot, shareTarget);
        const poster = model ? await createPoster(model, this.snapshot) : null;
        if (!this.ensureCurrentContext()) return;
        this.model = model;
        this.poster = poster;
        this.shareTarget = shareTarget;
        const overlay = this.previewPane.querySelector(".bsp-poster-updating");
        const frame = this.previewPane.querySelector(".bsp-preview-frame");
        if (frame && overlay && poster) {
          frame.replaceChildren(poster, overlay);
          this.fitPoster();
          overlay.classList.add("is-leaving");
          await new Promise((resolve) => setTimeout(resolve, motionDelay(MOTION.overlay)));
          overlay.remove();
        }
        if (this.ensureCurrentContext()) this.renderReady(poster, shareTarget);
      } catch (error) {
        if (this.ensureCurrentContext()) this.renderError(error, false);
      }
    }
    setExportButtonsDisabled(disabled) {
      for (const button of this.exportButtons) button.disabled = disabled;
      for (const button of this.previewPane.querySelectorAll("button")) button.disabled = disabled;
      for (const button of this.controls.querySelectorAll(".bsp-option-pill,input")) {
        if (disabled) button.disabled = true;
      }
    }
    showUpdatingOverlay() {
      const frame = this.previewPane.querySelector(".bsp-preview-frame");
      if (!frame || frame.querySelector(".bsp-poster-updating")) return;
      frame.append(element("div", "bsp-poster-updating", "\u6B63\u5728\u66F4\u65B0\u6807\u8BB0"));
    }
    renderError(error, retryCapture) {
      const message = error instanceof Error ? error.message : "\u751F\u6210\u6D77\u62A5\u65F6\u53D1\u751F\u672A\u77E5\u9519\u8BEF\u3002";
      const retry = element("button", "bsp-button", "\u91CD\u8BD5");
      retry.type = "button";
      retry.addEventListener("click", () => {
        this.renderLoading();
        if (retryCapture) void this.captureThenLoad();
        else void this.loadSnapshot();
      });
      this.previewPane.replaceChildren(this.previewState("\u6682\u65F6\u65E0\u6CD5\u751F\u6210\u6D77\u62A5", retry));
      this.controls.replaceChildren(element("p", "bsp-error", message));
      if (retryCapture) this.controls.append(element("p", "bsp-help", "\u8BF7\u786E\u8BA4\u4E3B\u64AD\u653E\u5668\u5DF2\u7ECF\u52A0\u8F7D\uFF0C\u518D\u91CD\u8BD5\u3002"));
    }
    async posterPngDataUrl() {
      if (!this.poster || !this.model) throw new Error("\u6D77\u62A5\u9884\u89C8\u5C1A\u672A\u751F\u6210");
      return exportPosterPng(this.poster);
    }
    /** Keep the chosen output stable through asynchronous encoding and clipboard writes. */
    beginExport() {
      if (!this.ensureCurrentContext() || this.loading || this.updating || this.exporting) return null;
      this.exporting = true;
      const controls = /* @__PURE__ */ new Set([
        ...this.exportButtons,
        ...this.controls.querySelectorAll("button,input"),
        ...this.previewPane.querySelectorAll("button")
      ]);
      const states = Array.from(controls, (control) => ({ control, disabled: control.disabled }));
      for (const { control } of states) control.disabled = true;
      return () => {
        this.exporting = false;
        if (this.closed || this.loading || this.updating) return;
        for (const { control, disabled } of states) if (control.isConnected) control.disabled = disabled;
      };
    }
    async copyPoster(status) {
      if (!this.poster || !this.model) return;
      const finish = this.beginExport();
      if (!finish) return;
      this.clearStatus(status);
      try {
        const dataUrl = await this.posterPngDataUrl();
        if (!this.ensureCurrentContext()) return;
        const outcome = await copyPosterPngToClipboard(dataUrl);
        const feedback = describePosterCopyResult(outcome);
        this.showStatus(
          outcome.status === "copied" ? feedback.statusMessage : `${feedback.statusMessage} ${feedback.helpMessage}`,
          outcome.status !== "copied"
        );
      } catch {
        this.showStatus("\u6D77\u62A5\u590D\u5236\u5931\u8D25\u3002\u8BF7\u4F7F\u7528\u6D77\u62A5\u4E0B\u65B9\u7684\u4E0B\u8F7D\u56FE\u6807\u4FDD\u5B58 PNG\u3002", true);
      } finally {
        finish();
      }
    }
    async copyShareText(button, text, status, format = "\u666E\u901A\u6587\u6848") {
      const finish = this.beginExport();
      if (!finish) return;
      this.clearStatus(status);
      this.controls.querySelector(".bsp-manual-copy")?.remove();
      try {
        const outcome = await copyShareTextToClipboard(text);
        if (!this.ensureCurrentContext() || !button.isConnected) return;
        if (outcome.status === "copied") this.showStatus(`${format}\u5DF2\u590D\u5236\u3002`);
        else this.offerManualCopy(text, format);
      } catch {
        if (this.ensureCurrentContext() && button.isConnected) this.offerManualCopy(text, format);
      } finally {
        finish();
      }
    }
    offerManualCopy(text, format) {
      console.warn("[Bilibili Share] clipboard", { stage: "text-write", format });
      const source = element("textarea", "bsp-manual-copy");
      source.readOnly = true;
      source.value = text;
      source.rows = 6;
      source.setAttribute("aria-label", `\u624B\u52A8\u590D\u5236 ${format}`);
      this.controls.append(source);
      this.showStatus(`${format}\u590D\u5236\u5931\u8D25\u3002\u8BF7\u5728\u4E0B\u65B9\u6587\u672C\u6846\u4E2D\u624B\u52A8\u590D\u5236\u3002`, true);
      source.focus();
      source.select();
    }
    async copyCombined(text, status) {
      if (!this.poster || !this.model) return;
      const finish = this.beginExport();
      if (!finish) return;
      this.clearStatus(status);
      try {
        const dataUrl = await this.posterPngDataUrl();
        if (!this.ensureCurrentContext()) return;
        const outcome = await copyCombinedPosterAndText(dataUrl, text, () => this.ensureCurrentContext());
        const feedback = describeCombinedCopyResult(outcome);
        this.showStatus(`${feedback.statusMessage} ${feedback.helpMessage}`, outcome.status === "failed");
      } catch {
        this.showStatus("\u7EC4\u5408\u590D\u5236\u5931\u8D25\u3002\u6D77\u62A5\u8BF7\u4F7F\u7528\u201C\u590D\u5236\u6D77\u62A5\u201D\u6216\u201C\u4E0B\u8F7D\u201D\uFF1B\u6587\u6848\u4ECD\u5728\u4E0A\u65B9\uFF0C\u53EF\u624B\u52A8\u5168\u9009\u590D\u5236\u3002", true);
      } finally {
        finish();
      }
    }
    async download(status) {
      if (!this.poster || !this.snapshot || !this.model) return;
      const finish = this.beginExport();
      if (!finish) return;
      this.clearStatus(status);
      try {
        const dataUrl = await this.posterPngDataUrl();
        if (!this.ensureCurrentContext()) return;
        const link = document.createElement("a");
        link.download = buildPosterFilename(this.snapshot.bvid, /* @__PURE__ */ new Date(), this.options.partShare ? this.snapshot.partNumber : null);
        link.href = dataUrl;
        link.click();
        this.showStatus("PNG \u5DF2\u4E0B\u8F7D\u3002");
      } catch {
        this.showStatus("PNG \u751F\u6210\u5931\u8D25\uFF0C\u9884\u89C8\u4ECD\u4FDD\u7559\uFF1B\u8BF7\u91CD\u8BD5\u4E0B\u8F7D\u3002", true);
      } finally {
        finish();
      }
    }
  };

  // src/ui/styles.ts
  var STYLES = String.raw`
${MOTION_STYLES}
#bsp-entry { appearance:none; display:inline-flex; align-items:center; gap:8px; height:36px; margin-left:0; padding:0; border:0; border-radius:4px; background:transparent; color:#61666d; font:400 14px/1 "PingFang SC","Microsoft YaHei",sans-serif; cursor:pointer; vertical-align:middle; transition:color var(--bsp-motion-color) var(--bsp-ease-out); }
#bsp-entry.bsp-entry-dark { color:#b7bcc4; }
#bsp-entry:hover { color:#00aeec; }
#bsp-entry:focus-visible,.bsp-button:focus-visible,.bsp-close:focus-visible { outline:3px solid #00aeec; outline-offset:3px; }
#bsp-entry svg { width:24px; height:24px; }
.bsp-backdrop{--bsp-surface:#fff;--bsp-soft:#f6f7f8;--bsp-text:#18191c;--bsp-muted:#61666d;--bsp-line:#e3e5e7;--bsp-blue:#00aeec;--bsp-blue-bg:#e5f5fc;--bsp-error:#c95042;position:fixed;z-index:2147483646;inset:0;background:rgba(0,0,0,.4);display:grid;place-items:center;padding:24px;overflow:auto;font:14px/1.5 "PingFang SC","Microsoft YaHei",sans-serif;color:var(--bsp-text);animation:bsp-backdrop-in var(--bsp-motion-backdrop) var(--bsp-ease-out)}
.bsp-backdrop.bsp-appearance-dark{--bsp-surface:#24262b;--bsp-soft:#1d1f23;--bsp-text:#edf0f3;--bsp-muted:#a2a9b3;--bsp-line:#3a3e46;--bsp-blue:#62c9ef;--bsp-blue-bg:#203d48;--bsp-error:#ffab9d}
.bsp-backdrop *,.bsp-backdrop *::before,.bsp-backdrop *::after{box-sizing:border-box}
.bsp-backdrop.bsp-backdrop-closing{opacity:0;transition:opacity var(--bsp-motion-fast) var(--bsp-ease-in-out)}
.bsp-panel{position:relative;width:min(920px,100%);max-height:calc(100dvh - 48px);background:var(--bsp-surface);border:0;border-radius:8px;box-shadow:0 2px 12px #00000014;overflow:auto;animation:bsp-panel-in var(--bsp-motion-open) var(--bsp-ease-out)}
.bsp-panel:focus{outline:none}.bsp-panel.bsp-panel-closing{opacity:0;transform:translateY(8px);transition:opacity var(--bsp-motion-fast),transform var(--bsp-motion-fast)}
.bsp-panel button,.bsp-panel input,.bsp-panel textarea{font:inherit}
.bsp-panel button{appearance:none;cursor:pointer;border:1px solid var(--bsp-line);border-radius:6px;color:var(--bsp-text);background:var(--bsp-surface);padding:9px 16px}
.bsp-panel button:hover:not(:disabled){border-color:var(--bsp-blue);color:var(--bsp-blue)}
.bsp-panel button:disabled{cursor:not-allowed;opacity:.45}
.bsp-panel button:focus-visible,.bsp-panel input:focus-visible,.bsp-panel textarea:focus-visible,.bsp-text-content:focus-visible{outline:3px solid var(--bsp-blue);outline-offset:4px}
.bsp-panel-head{position:relative;min-height:64px;display:flex;align-items:center;justify-content:center;padding:20px 54px 12px}
#bsp-dialog-title{margin:0;font-size:16px;line-height:24px;font-weight:400}
.bsp-panel .bsp-close{position:absolute;right:14px;top:14px;width:32px;height:32px;border:0;background:none;padding:7px;color:var(--bsp-muted);display:grid;place-content:center}
.bsp-close svg{width:18px;height:18px;stroke-width:1.8}.bsp-panel .bsp-close:hover{background:var(--bsp-soft);color:var(--bsp-blue)}
.bsp-workspace{display:grid;grid-template-columns:minmax(0,1.03fr) minmax(0,1fr);gap:32px;padding:12px 28px 26px}
.bsp-preview-pane{min-width:0;padding:0;background:transparent;border:0}
.bsp-preview-frame{width:100%;max-width:380px;aspect-ratio:3/4;position:relative;margin:auto;overflow:hidden;box-shadow:0 2px 10px #0000000d;border-radius:2px;background:#dce8e7}
.bsp-preview-frame>.bsp-poster{position:absolute;top:0;left:0}
.bsp-preview-download{max-width:380px;display:flex;justify-content:center;margin:10px auto 0}
.bsp-panel .bsp-download{width:36px;height:32px;padding:6px;border:0;background:transparent;color:var(--bsp-muted);display:grid;place-content:center;border-radius:6px}
.bsp-download svg{width:20px;height:20px}.bsp-panel .bsp-download:hover:not(:disabled){background:var(--bsp-soft)}
.bsp-controls{padding:0;display:flex;flex-direction:column;gap:24px;min-width:0}
.bsp-options{border:0;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:12px;min-width:0}
.bsp-panel .bsp-option-pill{position:relative;flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:9px 8px;border:1px solid var(--bsp-line);border-radius:6px;font-size:12px;white-space:nowrap;background:transparent;color:var(--bsp-muted)}
.bsp-option-pill svg{width:16px;height:16px;flex:none}.bsp-panel .bsp-option-pill.is-on{background:var(--bsp-blue-bg);border-color:var(--bsp-blue);color:var(--bsp-blue)}
.bsp-option-notice{flex-basis:100%;font-size:11px;line-height:1.6;margin:0;color:var(--bsp-muted)}
.bsp-section-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.bsp-section-heading h3{margin:0;font-size:14px;font-weight:400;white-space:nowrap}
.bsp-text-copy-actions{display:flex;gap:14px;align-items:center}.bsp-panel .bsp-text-copy-actions button{border:0;padding:3px 0;background:transparent;color:var(--bsp-blue);font-size:12px;white-space:nowrap}
.bsp-panel .bsp-text-copy-actions button:hover:not(:disabled){color:#40c5f1}
.bsp-text-content{border:0;background:var(--bsp-soft);border-radius:6px;padding:16px;font-size:13px;line-height:1.85;max-height:270px;min-height:190px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;user-select:text}
.bsp-text-card-link{display:inline-block;vertical-align:top;width:100%;margin:0;color:var(--bsp-blue)}
.bsp-text-options{display:flex;margin-top:14px}.bsp-text-options label{font-size:12px;color:var(--bsp-muted);display:flex;gap:7px;align-items:center;cursor:pointer}
.bsp-text-options input{accent-color:var(--bsp-blue);width:14px;height:14px;margin:0}
.bsp-action-group{margin-top:auto;margin-bottom:42px}
.bsp-actions{display:flex;gap:12px}.bsp-panel .bsp-actions button{flex:1;min-height:40px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;padding:8px;border-radius:6px}
.bsp-actions svg{width:18px;height:18px;flex:none}.bsp-panel .bsp-action-primary{background:var(--bsp-blue);border-color:var(--bsp-blue);color:#fff}.bsp-panel .bsp-action-primary:hover:not(:disabled){background:#40c5f1;border-color:#40c5f1;color:#fff}
.bsp-status{font-size:11px;line-height:1.7;color:var(--bsp-muted);margin:10px 0 0}.bsp-status:empty,.bsp-status:not(.is-show){display:none}.bsp-status.is-error{color:var(--bsp-error)}
.bsp-loading-card{width:100%;max-width:380px;aspect-ratio:3/4;position:relative;margin:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;background:#eef4f1;color:#405e65;font-size:14px;text-align:center}
.bsp-loading-card p{margin:0}.bsp-panel .bsp-loading-card button{font-size:13px;background:#f9fbfa;border-color:#adc2c2;color:#405e65}
.bsp-poster-updating{position:absolute;inset:0;z-index:2;background:#eef4f1b8;display:grid;place-items:center;color:#405e65;font-size:14px;transition:opacity var(--bsp-motion-overlay)}
.bsp-poster-updating.is-leaving{opacity:0}
.bsp-spinner{width:22px;height:22px;border:2px solid #b8c9ca;border-top-color:#405e65;border-radius:50%;animation:bsp-spin 1s linear infinite}
.bsp-error{font-size:13px;color:var(--bsp-error);line-height:1.7;margin:0}.bsp-help{font-size:12px;color:var(--bsp-muted);line-height:1.7;margin:0}
.bsp-manual-copy{width:100%;padding:12px;background:var(--bsp-soft);color:var(--bsp-text);border:1px solid var(--bsp-line);border-radius:6px;resize:vertical;font-size:13px!important}
@keyframes bsp-spin{to{transform:rotate(360deg)}}
@keyframes bsp-backdrop-in{from{opacity:0}to{opacity:1}}
@keyframes bsp-panel-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@media(max-width:760px){
.bsp-backdrop{padding:10px;display:block}.bsp-panel{max-height:none}.bsp-panel-head{padding:17px 48px 12px;min-height:56px}.bsp-panel .bsp-close{right:10px;top:10px}
.bsp-workspace{grid-template-columns:1fr;padding:6px 20px 22px;gap:22px}.bsp-preview-frame{max-width:340px}.bsp-preview-download{margin-top:8px}.bsp-controls{gap:22px}
.bsp-options{gap:8px}.bsp-panel .bsp-option-pill{font-size:11px;gap:5px;padding:9px 5px}.bsp-section-heading{gap:6px}.bsp-section-heading h3{font-size:13px}.bsp-text-copy-actions{gap:10px}.bsp-panel .bsp-text-copy-actions button{font-size:11px}
.bsp-text-content{min-height:140px;padding:14px}.bsp-action-group{margin:0}.bsp-panel .bsp-actions button{font-size:13px}
}
`;

  // src/index.ts
  var activePanel = null;
  var mountQueued = false;
  var pageAppearance = "light";
  function installStyles() {
    if (document.getElementById("bsp-styles")) return;
    const style = document.createElement("style");
    style.id = "bsp-styles";
    style.textContent = STYLES;
    document.head.append(style);
  }
  function openPanel() {
    if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
    if (activePanel) {
      activePanel.focus();
      return;
    }
    activePanel = new SharePanel(() => {
      activePanel = null;
    });
    activePanel.setAppearance(pageAppearance);
    activePanel.open();
  }
  function mountEntry() {
    mountQueued = false;
    if (activePanel && !activePanel.matchesCurrentPage()) activePanel.close(false);
    if (!readPageIdentity()) return;
    mountSharePosterEntry(pageAppearance, openPanel);
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
  observePageAppearance((appearance) => {
    pageAppearance = appearance;
    setEntryAppearance(appearance);
    activePanel?.setAppearance(appearance);
  });
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
