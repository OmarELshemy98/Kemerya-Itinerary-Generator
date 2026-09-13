/* Quick smoke test: renders an Arabic/Hebrew/CJK PDF with the registered fonts. */
const React = require("react");
const path = require("path");
const { Document, Page, Text, View, StyleSheet, renderToFile, Font } = require("@react-pdf/renderer");

Font.registerHyphenationCallback((w) => [w]);
const f = (n) => path.join(__dirname, "../public/fonts", n);
Font.register({ family: "Cairo", fonts: [{ src: f("notonaskharabic-400.ttf") }] });
Font.register({ family: "NotoSansHebrew", fonts: [{ src: f("notosanshebrew-400.ttf") }] });
Font.register({ family: "NotoSansSC", fonts: [{ src: f("notosanssc-400.otf") }] });
Font.register({ family: "NotoSansJP", fonts: [{ src: f("notosansjp-400.otf") }] });

const s = StyleSheet.create({
  page: { padding: 40 },
  ar: { fontFamily: "Cairo", fontSize: 16, marginBottom: 10 },
  he: { fontFamily: "NotoSansHebrew", fontSize: 16, marginBottom: 10 },
  zh: { fontFamily: "NotoSansSC", fontSize: 16, marginBottom: 10 },
  ja: { fontFamily: "NotoSansJP", fontSize: 16, marginBottom: 10 },
});

const doc = React.createElement(
  Document,
  null,
  React.createElement(
    Page,
    { size: "A4", style: s.page },
    React.createElement(View, null,
      React.createElement(Text, { style: s.ar }, "مرحبا بكم في كيميريا تورز — رحلة سياحية مميزة"),
      React.createElement(Text, { style: s.he }, "ברוכים הבאים לקמריה טורס"),
      React.createElement(Text, { style: s.zh }, "欢迎来到凯梅里亚旅游"),
      React.createElement(Text, { style: s.ja }, "ケメリア ツアーズへようこそ")
    )
  )
);

renderToFile(doc, path.join(__dirname, "font-test.pdf"))
  .then(() => {
    console.log("OK: font-test.pdf written successfully");
    process.exit(0);
  })
  .catch((e) => {
    console.error("FAIL:", (e && e.stack) || e);
    process.exit(1);
  });
