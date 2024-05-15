import ReactPDF from '@react-pdf/renderer';
import ColoringPageDocument from '@/components/pdfs/ColoringPageDocument/ColoringPageDocument';

const generatePDF = async (content: string) => {
  const doc = <ColoringPageDocument content={content} />;

  try {
    const stream = await ReactPDF.renderToStream(doc);

    return stream;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};

export default generatePDF;
