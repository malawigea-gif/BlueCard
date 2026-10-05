import { getT } from "@/lib/i18n/server";
import { RichText } from "@/components/RichText";
import { POLICIES, getPolicy, type PolicyId } from "@/lib/policies";

export async function policyMetadata(id: PolicyId) {
  const { t } = await getT();
  return { title: t(POLICIES[id].title) };
}

/** A legal page (privacy, refunds, terms) with the text from Admin › Policies or the standard text. */
export async function PolicyPage({ id }: { id: PolicyId }) {
  const { t, locale } = await getT();
  const text = await getPolicy(id, locale);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold text-navy-800 md:text-4xl">{t(POLICIES[id].title)}</h1>
      <div className="mt-2 h-1 w-16 rounded bg-gold-400" />
      <article className="card mt-8 p-6 md:p-10">
        <RichText text={text} justify={false} />
      </article>
    </div>
  );
}
