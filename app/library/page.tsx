import { allCharacters } from '@/lib/data';
import LibraryView from '@/components/LibraryView';

export default function LibraryPage() {
  return <LibraryView characters={[...allCharacters]} />;
}
