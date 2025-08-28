
import { db } from './firebase';
import { ref, runTransaction } from 'firebase/database';

export async function getNextOrderId(): Promise<string> {
    const counterRef = ref(db, 'orderCounter');
    let newId = 'XZ0001';

    try {
        const { committed, snapshot } = await runTransaction(counterRef, (currentValue) => {
            if (currentValue === null) {
                // Initialize the counter if it doesn't exist.
                return 1;
            }
            // Increment the counter.
            return (currentValue || 0) + 1;
        });

        if (committed) {
            const nextIdNumber = snapshot.val();
            newId = `XZ${String(nextIdNumber).padStart(4, '0')}`;
        }
    } catch(error) {
        console.error("Transaction failed to get next order ID: ", error);
        // Fallback to a random ID or handle the error as appropriate
    }
    
    return newId;
}
