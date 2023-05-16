{
    const b1   = BigInt("0x01");
    const b2   = BigInt("0x02");
    const b4   = BigInt("0x04");
    const b8   = BigInt("0x08");
    const b16  = BigInt("0x10");
    const b32  = BigInt("0x20");
    const b56  = BigInt("0x38");
    const b7f  = BigInt("0x7f");
    const bm1  = BigInt("0x5555555555555555");
    const bm2  = BigInt("0x3333333333333333");
    const bm4  = BigInt("0x0f0f0f0f0f0f0f0f");
    const bm8  = BigInt("0x00ff00ff00ff00ff");
    const bm16 = BigInt("0x0000ffff0000ffff");
    const bm32 = BigInt("0x00000000ffffffff");
    const bh01 = BigInt("0x0101010101010101");

    const NumberUtility = {
        /**
         * https://en.wikipedia.org/wiki/Hamming_weight
         */
        popcountFromBigInt : function (x) {
/*
            x -= (x >> b1) & bm1;
            x = (x & bm2) + ((x >> b2) & bm2);
            x = (x + (x >> b4)) & bm4;
            return (x * bh01) >> b56;
*/
            x -= (x >> b1) & bm1;             //put count of each 2 bits into those 2 bits
            x = (x & bm2) + ((x >> b2) & bm2); //put count of each 4 bits into those 4 bits 
            x = (x + (x >> b4)) & bm4;        //put count of each 8 bits into those 8 bits 
            x += x >>  b8;  //put count of each 16 bits into their lowest 8 bits
            x += x >> b16;  //put count of each 32 bits into their lowest 8 bits
            x += x >> b32;  //put count of each 64 bits into their lowest 8 bits
            return x & b7f;
        },
        hammingWeightFromBigInt : function (x1, x2) {
            return NumberUtility.popcountFromBigInt(x1^x2);
        }
    }
    self.NumberUtility = NumberUtility;
}
