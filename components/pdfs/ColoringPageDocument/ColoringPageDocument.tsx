import { useEffect, useState } from 'react';
import { ColoringImage } from '@prisma/client';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';
import SvgToReactPdf from '@/components/SvgToReactPdf/SvgToReactPdf';
import fetchSvg from '@/utils/fetchSvg';

// create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  main: {
    flexGrow: 1,
  },
  body: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  coloringImage: {
    width: '100%', // ensure the SVG fills the available width
    height: 'auto', // maintain the aspect ratio
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  qrCodeImage: {
    width: '120px',
    height: '120px',
  },
  cta: {
    display: 'flex',
    flexDirection: 'column',
    justifyItems: 'space-between',
    gap: 4,
    maxWidth: '50%',
  },
  ctaText: {
    fontSize: 18,
  },
  ctaLink: {
    fontSize: 16,
  },
});

type ColoringPageDocumentProps = {
  coloringImage: Partial<ColoringImage>;
};

const ColoringPageDocument = ({ coloringImage }: ColoringPageDocumentProps) => {
  const [imageSvg, setImageSvg] = useState<string>();
  const [qrCodeSvg, setQrCodeSvg] = useState<string>();

  useEffect(() => {
    if (!coloringImage.svgUrl) return;

    fetchSvg(coloringImage.svgUrl).then((imageSvgString) => {
      setImageSvg(imageSvgString);
    });
  }, [coloringImage.svgUrl]);

  useEffect(() => {
    if (!coloringImage.qrCodeUrl) return;

    fetchSvg(coloringImage.qrCodeUrl).then((qrCodeSvgString) => {
      setQrCodeSvg(qrCodeSvgString);
    });
  }, [coloringImage.qrCodeUrl]);

  if (
    !coloringImage.svgUrl ||
    !imageSvg ||
    !coloringImage.qrCodeUrl ||
    !qrCodeSvg
  ) {
    return null;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.main}>
          <SvgToReactPdf svgString={imageSvg} style={styles.coloringImage} />
        </View>
        <View style={styles.footer}>
          <SvgToReactPdf svgString={qrCodeSvg} style={styles.qrCodeImage} />
          <View style={styles.cta}>
            <Text style={styles.ctaText}>
              Scan the QR code to discover more coloring pages!
            </Text>
            <Link
              src={`https://chunkycrayon.com?utm_source=${coloringImage.id}&utm_medium=pdf-link&utm_campaign=coloring-image-pdf`}
              style={styles.ctaLink}
            >
              www.chunkycrayon.com
            </Link>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ColoringPageDocument;
