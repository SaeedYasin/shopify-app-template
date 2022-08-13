// ✨ Make all optional properties required
interface Employee {
  id?: number;
  name: string;
  salary?: number;
}

export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

const emp1: WithRequiredProperty<Employee, "salary"> = {
  name: "James",
  salary: 100,
};

// ✨ Make some required properties optional
interface SomeType {
  prop1: string;
  prop2: string;
  prop3: string;
  propn: string;
}

export type OptionalExceptFor<T, TRequired extends keyof T> = Partial<T> &
  Pick<T, TRequired>;

type NewType = OptionalExceptFor<SomeType, "prop1" | "prop2">;

let o: NewType = {
  prop1: "",
  prop2: "",
};

// ✨ Make a required property optional
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

type Person = {
  name: string;
  hometown: string;
  nickname: string;
};

type PersonWithOptionalProperties = Optional<Person, "hometown" | "nickname">;

const person: PersonWithOptionalProperties = {
  name: "John",
};
