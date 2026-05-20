
// إضافة إلى الملف الموجود
export async function addTransaction(description, amount, type, referenceId = null) {
  const transaction = {
    id: generateId('txn'),
    description,
    amount,
    type, // 'income' or 'expense'
    referenceId,
    timestamp: Date.now()
  };
  await saveEntity('transaction', transaction.id, transaction);
  // يمكن تحديث الرصيد (سيتم حسابه من المعاملات)
  return transaction;
}

export async function getBalance() {
  const transactions = await loadEntitiesByType('transaction');
  let balance = 0;
  for (const txn of transactions) {
    if (txn.type === 'income') balance += txn.amount;
    else balance -= txn.amount;
  }
  return balance;
}
