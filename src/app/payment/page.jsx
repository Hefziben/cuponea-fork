import { Suspense } from "react";
import Payment from "./content";

export default function PaymentPage() {
  return (
    <Suspense>
      <Payment />
    </Suspense>
  );
}
