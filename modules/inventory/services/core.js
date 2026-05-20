import { saveEntity, loadEntity, loadEntitiesByType } from '../../../app/storage/adapters/local.adapter.js';
import { generateId } from '../../../app/utils/helpers.js';

export async function addProduct(name, sku, quantity, price, warehouse = 'main') {
  const product = {
    id: generateId('prod'),
    name,
    sku,
    quantity,
    price,
    warehouse,
    minStock: 5,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await saveEntity('product', product.id, product);
  return product;
}

export async function updateStock(productId, delta) {
  const product = await loadEntity('product', productId);
  if (!product) throw new Error('Product not found');
  product.quantity += delta;
  product.updatedAt = Date.now();
  await saveEntity('product', productId, product);
  return product;
}

export async function listProducts() {
  return loadEntitiesByType('product');
}

export async function getLowStockProducts(threshold = 5) {
  const all = await listProducts();
  return all.filter(p => p.quantity < threshold);
}
