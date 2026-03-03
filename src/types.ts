export interface Product {
  sku: string;
  name: string;
  description: string;
}

export interface Center {
  id: string;
  name: string;
}

export interface LabelData {
  center: string;
  productCode: string;
  productDescription: string;
  batch: string;
  fefo: string;
}

export const MOCK_CENTERS: Center[] = [
  { id: '1', name: 'Acute Unit Santiago' },
  { id: '2', name: 'Acute Unit Vina' },
  { id: '3', name: 'Alfadial' },
];

export const MOCK_PRODUCTS: Product[] = [
  { sku: '101-108-001', name: 'AGUJA FISTULA 14G ART. ROT.WING X CAJA 50 UN', description: 'AGUJA FISTULA 14G ART. ROT.WING X CAJA 50 UN' },
  { sku: '101-108-002', name: 'AVF AGUJA 15G, 1 INCH, 30 CM, WITH BACK CAJA X 50 UN', description: 'AVF AGUJA 15G, 1 INCH, 30 CM, WITH BACK CAJA X 50 UN' },
];
