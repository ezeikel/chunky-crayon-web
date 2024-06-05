import { Svg, Path } from '@react-pdf/renderer';

type SvgProps = {
  width?: string | number;
  height?: string | number;
  viewBox?: string;
  preserveAspectRatio?: string;
  style?: object;
};

type SvgElementProps = {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  [key: string]: any;
};
const parseSvg = (
  svgString: string,
): {
  svgProps: SvgProps;
  paths: SvgElementProps[];
} => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');

  if (!svgElement) {
    throw new Error('Invalid SVG string: SVG element not found');
  }

  const svgProps: SvgProps = {
    width: svgElement.getAttribute('width') || undefined,
    height: svgElement.getAttribute('height') || undefined,
    viewBox: svgElement.getAttribute('viewBox') || undefined,
    preserveAspectRatio:
      svgElement.getAttribute('preserveAspectRatio') || undefined,
    style: svgElement.getAttribute('style')
      ? JSON.parse(svgElement.getAttribute('style')!)
      : undefined,
  };

  const paths = Array.from(svgElement.querySelectorAll('path'))
    .filter((path) => {
      const d = path.getAttribute('d');

      if (!d) {
        console.error('Invalid path element: "d" attribute not found', path);
      }

      return !!d;
    })
    .map((path) => {
      const d = path.getAttribute('d') as string;

      return {
        d,
        fill: path.getAttribute('fill') || undefined,
        stroke: path.getAttribute('stroke') || undefined,
        strokeWidth: path.getAttribute('stroke-width')
          ? parseFloat(path.getAttribute('stroke-width')!)
          : undefined,
      };
    });

  return { svgProps, paths };
};

type SvgToReactPdfProps = {
  svgString: string;
  style?: any; // TODO:
};

const SvgToReactPdf = ({ svgString, style }: SvgToReactPdfProps) => {
  const { svgProps, paths } = parseSvg(svgString);

  // Ensure we don't spread undefined values
  const filteredSvgProps = Object.fromEntries(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(svgProps).filter(([_, v]) => v !== undefined),
  );

  return (
    <Svg
      style={style}
      viewBox="0 0 1024 1024"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...filteredSvgProps}
    >
      {paths.map((pathProps, index) => (
        // eslint-disable-next-line react/jsx-props-no-spreading, react/no-array-index-key
        <Path key={index} {...pathProps} />
      ))}
    </Svg>
  );
};

export default SvgToReactPdf;
