import { PolicyPage, policyMetadata } from "@/components/PolicyPage";

export const dynamic = "force-dynamic";
export const generateMetadata = () => policyMetadata("terms");

export default function Page() {
  return <PolicyPage id="terms" />;
}
