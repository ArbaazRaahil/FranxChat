/**
 * Comprehensive Unit Tests for Database & Real-Time Logic
 * Validates:
 * - Optimistic like counter increment & decrement
 * - Boundary protection against negative counts (CHECK likes_count >= 0)
 * - Idempotency guard on comment insertion (protecting against duplicate broadcasts)
 * - Bi-directional conversation pairing
 */

export function calculateOptimisticLike(
  currentCount: number,
  isCurrentlyLiked: boolean
): { newCount: number; newIsLiked: boolean } {
  const newIsLiked = !isCurrentlyLiked;
  const newCount = newIsLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
  return { newCount, newIsLiked };
}

export function deduplicateComments<T extends { id: string }>(existing: T[], incoming: T): T[] {
  if (existing.some((item) => item.id === incoming.id)) {
    return existing; // idempotent no-op
  }
  return [...existing, incoming];
}

export function generateConversationKey(userA: string, userB: string): string {
  return [userA, userB].sort().join('_');
}

export function runDatabaseUnitTests(): { passed: number; failed: number; results: string[] } {
  const results: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(description: string, condition: boolean) {
    if (condition) {
      passed++;
      results.push(`✅ PASS: ${description}`);
    } else {
      failed++;
      results.push(`❌ FAIL: ${description}`);
    }
  }

  // 1. Optimistic Like tests
  const likeAction = calculateOptimisticLike(10, false);
  assert('Liking post increments counter from 10 to 11', likeAction.newCount === 11 && likeAction.newIsLiked === true);

  const unlikeAction = calculateOptimisticLike(11, true);
  assert('Unliking post decrements counter from 11 to 10', unlikeAction.newCount === 10 && unlikeAction.newIsLiked === false);

  const zeroFloorAction = calculateOptimisticLike(0, true);
  assert('Unliking post at 0 clamps counter at 0 (prevents negative likes)', zeroFloorAction.newCount === 0);

  // 2. Idempotent comment stream deduplication
  const existingComments = [{ id: 'cmt_1' }, { id: 'cmt_2' }];
  const dupComment = { id: 'cmt_1' };
  const resDup = deduplicateComments(existingComments, dupComment);
  assert('Duplicate comment broadcast is ignored (idempotent)', resDup.length === 2);

  const newComment = { id: 'cmt_3' };
  const resNew = deduplicateComments(existingComments, newComment);
  assert('Fresh comment is successfully appended to stream', resNew.length === 3);

  // 3. Symmetric conversation key generation
  const key1 = generateConversationKey('usr_alice', 'usr_bob');
  const key2 = generateConversationKey('usr_bob', 'usr_alice');
  assert('Bi-directional user pairing yields symmetric conversation key', key1 === key2);

  return { passed, failed, results };
}
