declare module 'random-name' {
  declare function randomName(): string;
  declare namespace randomName {
    function first(): string;
    function last(): string;
    function middle(): string;
    function place(): string;
  }
  export = randomName;
}
