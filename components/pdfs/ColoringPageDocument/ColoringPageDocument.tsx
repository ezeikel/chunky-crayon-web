import { ColoringImage } from '@prisma/client';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  body: {
    fontSize: 12,
    lineHeight: 1.5,
  },
  image: {
    border: '1px dashed #000000',
  },
  qrCode: {
    width: 350,
    height: 350,
  },
});

type ColoringPageDocumentProps = {
  coloringImage: Partial<ColoringImage>;
};

const ColoringPageDocument = ({ coloringImage }: ColoringPageDocumentProps) => {
  if (!coloringImage.url) {
    return null;
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{coloringImage.title}</Text>
          <Image src={coloringImage.url} style={styles.image} />
        </View>
        <View>
          <View>
            {coloringImage.qrCodeUrl ? (
              <Image src={coloringImage.qrCodeUrl} style={styles.qrCode} />
            ) : null}
            <Text>Scan this QR code to create more pages like this</Text>
          </View>
          <View>
            <Text>Visit Chunky Crayon for more fun!</Text>
            <Text>chunkycrayon.com</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ColoringPageDocument;
