import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

type ColoringContextArgs = {
  selectedColor: string;
  setSelectedColor: Dispatch<SetStateAction<string>>;
};

type ColoringContextProviderProps = {
  children: React.ReactNode;
};

export const ColoringContext = createContext<ColoringContextArgs>({
  selectedColor: '',
  setSelectedColor: () => {},
});

export const ColoringContextProvider = ({
  children,
}: ColoringContextProviderProps) => {
  const [selectedColor, setSelectedColor] = useState('#000000');

  return (
    <ColoringContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        selectedColor,
        setSelectedColor,
      }}
    >
      {children}
    </ColoringContext.Provider>
  );
};

export const useColoringContext = () => {
  const context = useContext(ColoringContext);
  if (context === undefined) {
    throw new Error('useUIContext must be used within a UIContextProvider');
  }

  return context;
};
