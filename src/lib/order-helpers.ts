import { db } from './firebase';
import { ref, transaction } from 'firebase/database';

export async function getNextOrderId(): Promise<string> {
    const counterRef = ref(db, 'orderCounter');
    let newId = 'XZ0001';

    try {
        const { committed, snapshot } = await transaction(counterRef, (currentValue) => {
            if (currentValue === null) {
                return 1;
            }
            return (currentValue || 0) + 1;
        });

        if (committed) {
            const nextIdNumber = snapshot.val();
            newId = `XZ${String(nextIdNumber).padStart(4, '0')}`;
        }
    } catch(error) {
        console.error("Transaction failed: ", error);
        // Fallback or error handling
    }
    
    return newId;
}
