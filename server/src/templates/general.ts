type ConstructorType = StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor;

export type TemplateField = {
  type: ConstructorType | ArrayConstructor;
  required: boolean;
  elementType?: ConstructorType;
};

export type TemplateObject = Record<string, TemplateField>;
