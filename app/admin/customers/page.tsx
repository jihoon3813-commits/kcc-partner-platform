'use client';

import { Suspense } from 'react';
import { CustomerList } from './CustomerList';

export default function AdminCustomersPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400">화면 고치는 중...</div>}>
            <CustomerList />
        </Suspense>
    );
}
