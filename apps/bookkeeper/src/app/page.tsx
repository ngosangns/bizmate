import { actionGetState } from "../actions/hitl";
import { BookkeeperScreen } from "../components/BookkeeperScreen";

export const dynamic = "force-dynamic";

export default async function Page() {
  const initial = await actionGetState();
  return <BookkeeperScreen initial={initial} />;
}
