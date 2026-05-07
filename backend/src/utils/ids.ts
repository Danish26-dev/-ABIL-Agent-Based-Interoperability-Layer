let counter = 0;

export const nextId = (prefix: string) => {
  counter += 1;
  return `${prefix}_${String(counter).padStart(4, '0')}`;
};

export const isoNow = () => new Date().toISOString();
