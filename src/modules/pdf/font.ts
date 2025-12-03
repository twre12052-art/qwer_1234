"use client";

import { Font } from "@react-pdf/renderer";

// Register font
// Use a public CDN for NanumGothic
Font.register({
  family: "NanumGothic",
  src: "https://fonts.gstatic.com/s/nanumgothic/v23/PN_3Rfi-oW3hYwmKDpxS7F_z-7rE7Jzu.ttf",
});

export const fontStyle = {
    fontFamily: "NanumGothic",
};

