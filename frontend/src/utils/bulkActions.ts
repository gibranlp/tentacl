export const executeBulkAction = async <T>(
  ids: string[],
  action: (id: string) => Promise<T>
): Promise<void> => {
  for (const id of ids) {
    try {
      await action(id);
    } catch (err) {
      console.error(`Error performing bulk action on ${id}:`, err);
    }
  }
};
