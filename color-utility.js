{
    let ColorUtility;
    
    /** 色モデルタイプ */
    const ColorModelType = {
        // 三角錐型
        CONE   : 1,
        // 円柱型
        COLUMN : 2,
    }

    /** 彩度範囲既定値 */
    const HueRange = {
        MIN : 0,
        MAX : 360
    }

    /** 各範囲既定値 */
    const Range = {
        RGB : {
            Red : {
                MIN : 0,
                MAX : 0xff
            },
            Green : {
                MIN : 0,
                MAX : 0xff
            },
            Blue : {
                MIN : 0,
                MAX : 0xff
            },
        },
        CMYK : {
            Cyan : {
                MIN : 0,
                MAX : 0xff
            },
            Magenta : {
                MIN : 0,
                MAX : 0xff
            },
            Yellow : {
                MIN : 0,
                MAX : 0xff
            },
            KeyPlate : {
                MIN : 0,
                MAX : 0xff
            },
        },
        HLS : {
            Lightness : {
                MIN : 0,
                MAX : 1
            },
            Saturation : {
                MIN : 0,
                MAX : 1
            }
        },
        HSV : {
            Saturation : {
                MIN : 0,
                MAX : 1
            },
            Value : {
                MIN : 0,
                MAX : 1
            }
        },
        Hue : {
            MIN : 0,
            MAX : 0xff
        }
    }

    /** 正規化 */
    const _getNormalize = function (numValue, numMin, numMax, blnModFlg) {
        const numRange = (numMax - numMin);
        if (blnModFlg) {
            return ((numValue - numMin) % numRange) / numRange;
        }
        return (numValue - numMin) / numRange;
    }

    /** 角度正規化 */
    const _getArcNormalize = function (numValue, numMin, numMax) {
        const numRange = (numMax - numMin);
        let result = numValue * numRange + numMin;
        if (numRange === 1) {
            return result;
        }
         return ~~(result + 0.5);
    }
    /** RGBから彩度を取得 */
    const _getHue = function (numR, numG, numB) {
        const numMin = Math.min(numR, numG, numB);
        const numMax = Math.max(numR, numG, numB);

        if (numMin === numB) {
            return 1/6 * (numG - numR) / (numMax - numMin) + 1/6;
        } else
        if (numMin === numR) {
            return 1/6 * (numB - numG) / (numMax - numMin) + 1/2;
        } else
        if (numMin === numG) {
            return 1/6 * (numR - numB) / (numMax - numMin) + 5/6;
        }
        return 0;
    }
    /** 彩度からRGBを取得 */
    const _getRGB = function (numH, numMin, numMax) {
        let result = [0, 0, 0];
        if (numMax === numMin) return result;
        numH = _getNormalize(numH, Range.Hue.MIN, Range.Hue.MAX, true);
        if (numH >= 0 && numH < 1/6) {
            result = [numMax, numMin + (numMax - numMin) * numH / (1/6), numMin];
        } else
        if (numH < 1/3) {
            result = [numMin + (numMax - numMin) * ((1/3) - numH) / (1/6), numMax, numMin];
        } else
        if (numH < 1/2) {
            result = [numMin, numMax, numMin + (numMax - numMin) * (numH - 1/3) / (1/6)];
        } else
        if (numH < 2/3) {
            result = [numMin, numMin + (numMax - numMin) * (2/3 - numH) / (1/6), numMax];
        } else
        if (numH < 5/6) {
            result = [numMin + (numMax - numMin) * (numH - 2/3) / (1/6), numMin, numMax];
        } else
        if (numH < 1) {
            result = [numMax, numMin, numMin + (numMax - numMin) * (1 - numH) / (1/6)];
        } else {
            result = [0, 0, 0];
        }
        return [
              _getArcNormalize(result[0], Range.RGB.Red.MIN  , Range.RGB.Red.MAX  )
            , _getArcNormalize(result[1], Range.RGB.Green.MIN, Range.RGB.Green.MAX)
            , _getArcNormalize(result[2], Range.RGB.Blue.MIN , Range.RGB.Blue.MAX )
        ];
    }

    ColorUtility = {
        /** RGB→HLS */
        fromRGBtoHLS : function (numR, numG, numB, intColorModelType) {
            if (typeof intColorModelType === "undefined") {
                intColorModelType = ColorModelType.CONE;
            }
            numR = _getNormalize(numR, Range.RGB.Red.MIN  , Range.RGB.Red.MAX  );
            numG = _getNormalize(numG, Range.RGB.Green.MIN, Range.RGB.Green.MAX);
            numB = _getNormalize(numB, Range.RGB.Blue.MIN , Range.RGB.Blue.MAX );
            const numH = _getHue(numR, numG, numB);
            const numL = 0;
            const numS = 0;
            const numMin = Math.min(numR, numG, numB);
            const numMax = Math.max(numR, numG, numB);
            numL = (numMax + numMin) / 2;

            if (intColorModelType === ColorModelType.CONE) {
                numS = numMax - numMin;
            } else
            if (intColorModelType === ColorModelType.COLUMN) {
                numS = (numMax - numMin) / (1 - Math.abs(numMax + numMin - 1));
            }

            return [
                  _getArcNormalize(numH, Range.Hue.MIN           , Range.Hue.MAX  )
                , _getArcNormalize(numL, Range.HLS.Lightness.MIN , Range.HLS.Lightness.MAX)
                , _getArcNormalize(numS, Range.HLS.Saturation.MIN, Range.HLS.Saturation.MAX)
            ];
        },
        /** RGB→HSV */
        fromRGBtoHSV : function (numR, numG, numB, intColorModelType) {
            if (typeof intColorModelType === "undefined") {
                intColorModelType = ColorModelType.CONE;
            }
            numR = _getNormalize(numR, Range.RGB.Red.MIN  , Range.RGB.Red.MAX  );
            numG = _getNormalize(numG, Range.RGB.Green.MIN, Range.RGB.Green.MAX);
            numB = _getNormalize(numB, Range.RGB.Blue.MIN , Range.RGB.Blue.MAX );
            const numH = _getHue(numR, numG, numB);
            const numS = 0;
            const numV = 0;
            const numMin = Math.min(numR, numG, numB);
            const numMax = Math.max(numR, numG, numB);
            numV = numMax;

            if (intColorModelType === ColorModelType.CONE) {
                numS = numMax - numMin;
            } else
            if (intColorModelType === ColorModelType.COLUMN) {
                numS = (numMax - numMin) / numMax;
            }
            return [
                  _getArcNormalize(numH, Range.Hue.MIN           , Range.Hue.MAX  )
                , _getArcNormalize(numS, Range.HSV.Saturation.MIN, Range.HSV.Saturation.MAX)
                , _getArcNormalize(numV, Range.HSV.Value.MIN     , Range.HSV.Value.MAX)
            ];
        },
        /** RGB→CMYK */
        fromRGBtoCMYK : function (numR, numG, numB) {
            numR = _getNormalize(numR, Range.RGB.Red.MIN  , Range.RGB.Red.MAX  );
            numG = _getNormalize(numG, Range.RGB.Green.MIN, Range.RGB.Green.MAX);
            numB = _getNormalize(numB, Range.RGB.Blue.MIN , Range.RGB.Blue.MAX );

            const numC = 1 - numR;
            const numM = 1 - numG;
            const numY = 1 - numB;
            const numK = Math.min(numC, numM, numY);
            numC = numC - numK;
            numM = numM - numK;
            numY = numY - numK;
            return [
                  _getArcNormalize(numC, Range.CMYK.Cyan.MIN    , Range.CMYK.Cyan.MAX)
                , _getArcNormalize(numM, Range.CMYK.Magenta.MIN , Range.CMYK.Magenta.MAX)
                , _getArcNormalize(numY, Range.CMYK.Yellow.MIN  , Range.CMYK.Yellow.MAX)
                , _getArcNormalize(numK, Range.CMYK.KeyPlate.MIN, Range.CMYK.KeyPlate.MAX)
            ];
        },
        /** CMYK→RGB */
        fromCMYKtoRGB : function (numC, numM, numY, numK) {
            numC = _getNormalize(numC, Range.CMYK.Cyan.MIN    , Range.CMYK.Cyan.MAX)
            numM = _getNormalize(numM, Range.CMYK.Magenta.MIN , Range.CMYK.Magenta.MAX)
            numY = _getNormalize(numY, Range.CMYK.Yellow.MIN  , Range.CMYK.Yellow.MAX)
            numK = _getNormalize(numK, Range.CMYK.KeyPlate.MIN, Range.CMYK.KeyPlate.MAX)
            return [
                  _getArcNormalize(1 - Math.min(1, numC * (1 - numK) + numK), Range.RGB.Red.MIN  , Range.RGB.Red.MAX  )
                , _getArcNormalize(1 - Math.min(1, numM * (1 - numK) + numK), Range.RGB.Green.MIN, Range.RGB.Green.MAX)
                , _getArcNormalize(1 - Math.min(1, numY * (1 - numK) + numK), Range.RGB.Blue.MIN , Range.RGB.Blue.MAX )
            ];
        },
        /** HLS→RGB */
        fromHLStoRGB : function (numH, numL, numS, intColorModelType) {
            if (typeof intColorModelType === "undefined") {
                intColorModelType = ColorModelType.CONE;
            }
            numL = _getNormalize(numL, Range.HLS.Lightness .MIN, Range.HLS.Lightness .MAX);
            numS = _getNormalize(numS, Range.HLS.Saturation.MIN, Range.HLS.Saturation.MAX);
            const numMax = 0;
            const numMin = 0;
            if (intColorModelType === ColorModelType.CONE) {
                numMax = numL + numS/2;
                numMin = numL - numS/2;
            } else
            if (intColorModelType === ColorModelType.COLUMN) {
                numMax = numL + (numS * (1 - Math.abs(2 * numL - 1)))/2;
                numMin = numL - (numS * (1 - Math.abs(2 * numL - 1)))/2;
            }
            return _getRGB(numH, numMin, numMax)
        },
        /** HSV→RGB */
        fromHSVtoRGB : function (numH, numS, numV, intColorModelType) {
            if (typeof intColorModelType === "undefined") {
                intColorModelType = ColorModelType.CONE;
            }
            numS = _getNormalize(numS, Range.HSV.Saturation.MIN, Range.HSV.Saturation.MAX);
            numV = _getNormalize(numV, Range.HSV.Value     .MIN, Range.HSV.Value     .MAX);
            const numMax = 0;
            const numMin = 0;
            if (intColorModelType === ColorModelType.CONE) {
                numMax = numV;
                numMin = numV - numS;
            } else
            if (intColorModelType === ColorModelType.COLUMN) {
                numMax = numV;
                numMin = numV * (1 - numS);
            }
            return _getRGB(numH, numMin, numMax)
        }
    }

    // エクスポート
    self.ColorUtility = ColorUtility;
    self.ColorUtility.ColorModelType = ColorModelType;
}
