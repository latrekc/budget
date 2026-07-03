const React = require("react");
// Library-only camelCase props that must not be forwarded to real DOM
// elements (React warns about unknown camelCase attributes). Stripped from any
// rest-spread that lands on a DOM node. data-*/aria-* and standard lowercase
// HTML attributes are intentionally left untouched.
const NEXTUI_ONLY_PROPS = [
  "startContent",
  "endContent",
  "classNames",
  "isInvisible",
  "showOutline",
  "placement",
  "shape",
  "isClearable",
  "labelPlacement",
  "fullWidth",
  "radius",
  "shadow",
  "disableAnimation",
  "isBordered",
  "baseRef",
  "isHeaderSticky",
  "showArrow",
  "backdrop",
  "defaultSelectedKeys",
  "selectedKeys",
  "selectionMode",
  "disableRipple",
  "spinnerProps",
  "popoverProps",
  "isIconOnly",
  "isDisabled",
  "isSelected",
  "isIndeterminate",
  "isInvalid",
  "isReadOnly",
  "isRequired",
  "onValueChange",
  "onSelectionChange",
  "onOpenChange",
  "onPress",
  "onClose",
  "onClear",
  "menuTrigger",
  "autoFocus",
  "disallowEmptySelection",
  "hideSelectedIcon",
  "isActive",
  "justify",
  "maxWidth",
];
const clean = (obj) => {
  const out = { ...obj };
  for (const key of NEXTUI_ONLY_PROPS) {
    delete out[key];
  }
  return out;
};
const createMock =
  (testId, extraProps = {}) =>
  (props) => {
    const { children, onPress, onClick, onValueChange, value, ...rest } =
      props || {};
    delete rest.label;
    delete rest.onClose;
    const handleClick =
      onPress ||
      onClick ||
      (() => onValueChange?.(Array.isArray(value) ? [] : ""));
    return React.createElement(
      "div",
      {
        "data-testid": testId,
        "data-value": JSON.stringify(value),
        onClick: handleClick,
        ...extraProps,
        ...clean(rest),
      },
      children,
    );
  };

// Shared contexts so compound components can coordinate (compound components are
// compound and pass state/handlers to descendants).
const TextFieldContext = React.createContext(null);
const ComboBoxContext = React.createContext(null);
const PopoverContext = React.createContext(null);
const AutocompleteContext = React.createContext(null);

const CheckboxGroup = (props) => {
  const { children, onChange, onValueChange, value, ...rest } = props || {};
  const handle = onChange || onValueChange;
  return React.createElement(
    "div",
    {
      "data-testid": rest["data-testid"] || "checkbox-group",
      "data-value": JSON.stringify(value),
      onClick: () => handle?.(Array.isArray(value) ? value : []),
      ...clean(rest),
    },
    children,
  );
};
const Checkbox = (props) => {
  const {
    children,
    isSelected,
    isIndeterminate,
    isDisabled,
    onChange,
    onValueChange,
    value,
    className,
    ...rest
  } = props || {};
  const handleChange = (e) => {
    const next = e?.target ? e.target.checked : !isSelected;
    if (onChange) {
      onChange(next);
    }
    onValueChange?.(next);
  };
  return React.createElement(
    "label",
    {
      "data-testid": rest["data-testid"] || "checkbox",
      "data-selected": isSelected ? "true" : "false",
      "data-indeterminate": isIndeterminate ? "true" : "false",
      "data-disabled": isDisabled ? "true" : "false",
      "data-value": value,
      className,
      ...clean(rest),
    },
    React.createElement("input", {
      type: "checkbox",
      checked: isSelected ?? false,
      disabled: isDisabled ?? false,
      onChange: handleChange,
      readOnly: true,
    }),
    children,
  );
};
// NextUI (v2) Input is a single component that owns its label, clear button
// and start/end content. The compound equivalent splits these across
// TextField/Label/InputGroup, so this mock emits the same observable DOM that
// this mock produces from those compound pieces: a <span> label (so
// getByText(label) works), the label echoed as the input placeholder, and the
// rendered start/end content.
const Input = (props) => {
  const {
    label,
    onValueChange,
    onChange,
    value,
    variant,
    isDisabled,
    disabled,
    "data-testid": dataTestId,
    placeholder,
    startContent,
    endContent,
    errorMessage,
    onClear,
    ...rest
  } = props || {};
  delete rest.isInvalid;
  delete rest.isClearable;
  delete rest.labelPlacement;
  const handleChange = onChange || ((e) => onValueChange?.(e.target.value));
  const inputProps = {
    "aria-label": label,
    placeholder: placeholder ?? label,
    onChange: handleChange,
    "data-variant": variant,
    disabled: isDisabled ?? disabled,
    "data-testid": dataTestId || "filter-input",
    ...rest,
  };
  if (value !== undefined && value !== null) {
    inputProps.value = value;
  }
  return React.createElement(
    React.Fragment,
    null,
    label != null ? React.createElement("span", null, label) : null,
    startContent,
    React.createElement("input", inputProps),
    onClear
      ? React.createElement(
          "button",
          { "data-testid": "clear-button", onClick: onClear },
          "clear",
        )
      : null,
    endContent,
    errorMessage
      ? React.createElement("div", { "data-testid": "error" }, errorMessage)
      : null,
  );
};
const Radio = (props) =>
  React.createElement(
    "div",
    { "data-testid": `radio-${props?.value}` },
    props?.children,
  );
const RadioGroup = (props) => {
  const { children, onChange, onValueChange, value, ...rest } = props || {};
  const handle = (next) => {
    if (onChange) {
      onChange(next);
    }
    onValueChange?.(next);
  };
  // Auto-generate a clickable helper per Radio child so tests can drive
  // selection via `set-<value>` test ids regardless of nesting.
  const helpers = [];
  const collect = (node) => {
    React.Children.forEach(node, (child) => {
      if (!child || typeof child !== "object") {
        return;
      }
      if (child.type === Radio && child.props?.value != null) {
        const val = child.props.value;
        helpers.push(
          React.createElement(
            "button",
            {
              key: `set-${val}`,
              "data-testid": `set-${String(val).toLowerCase()}`,
              onClick: () => handle(val),
            },
            String(val),
          ),
        );
      }
      if (child.props?.children) {
        collect(child.props.children);
      }
    });
  };
  collect(children);
  return React.createElement(
    "div",
    {
      "data-testid": rest["data-testid"] || "radio-group",
      "data-value": value,
      ...clean(rest),
    },
    ...helpers,
    children,
  );
};
const Chip = (props) => {
  const { children, onClose, ...rest } = props || {};
  return React.createElement(
    "div",
    { "data-testid": rest["data-testid"] || "chip", ...clean(rest) },
    children,
    onClose
      ? React.createElement(
          "button",
          { "data-testid": "close-button", onClick: onClose },
          "x",
        )
      : null,
  );
};
const Button = (props) => {
  const {
    children,
    onPress,
    onClick,
    variant,
    color,
    isIconOnly,
    isDisabled,
    disabled,
    "aria-label": ariaLabel,
    ...rest
  } = props || {};
  const handleClick = onPress || onClick;
  const testId = rest["data-testid"] || "button";
  return React.createElement(
    "button",
    {
      onClick: handleClick,
      "data-variant": variant,
      "data-color": color,
      "data-title": ariaLabel,
      "aria-label": ariaLabel,
      "data-is-icon-only": isIconOnly != null ? String(isIconOnly) : undefined,
      disabled: isDisabled ?? disabled,
      "data-disabled": isDisabled != null ? String(isDisabled) : undefined,
      ...clean(rest),
      "data-testid": testId,
    },
    children,
  );
};
const ButtonGroup = (props) =>
  React.createElement(
    "div",
    { "data-testid": "button-group" },
    props?.children,
  );
const Accordion = (props) =>
  React.createElement("div", { "data-testid": "accordion" }, props?.children);
const AccordionItem = (props) => {
  const { children, title, hidden, ...rest } = props || {};
  delete rest.textValue;
  if (hidden) {
    return null;
  }
  return React.createElement(
    "div",
    { "data-testid": "accordion-item", ...clean(rest) },
    title,
    children,
  );
};
Accordion.Item = AccordionItem;
const AccordionHeading = (props) =>
  React.createElement("div", {}, props?.children);
const AccordionTrigger = (props) =>
  React.createElement("div", {}, props?.children);
const AccordionPanel = (props) =>
  React.createElement("div", {}, props?.children);
const AccordionBody = (props) =>
  React.createElement("div", {}, props?.children);
const AccordionIndicator = (props) =>
  React.createElement("div", {}, props?.children);
Accordion.Heading = AccordionHeading;
Accordion.Trigger = AccordionTrigger;
Accordion.Panel = AccordionPanel;
Accordion.Body = AccordionBody;
Accordion.Indicator = AccordionIndicator;
const Popover = (props) => {
  const { children, isOpen, onOpenChange } = props || {};
  const content = typeof children === "function" ? children() : children;
  return React.createElement(
    PopoverContext.Provider,
    { value: { isOpen, onOpenChange } },
    React.createElement(
      "div",
      { "data-testid": "popover", "data-is-open": isOpen ? "true" : "false" },
      content,
    ),
  );
};
const PopoverTrigger = (props) => {
  const ctx = React.useContext(PopoverContext);
  return React.createElement(
    "div",
    {
      "data-testid": "popover-trigger",
      onClick: () => ctx?.onOpenChange?.(!ctx.isOpen),
    },
    props?.children,
  );
};
const PopoverContent = (props) => {
  const { children, ...rest } = props || {};
  const content = typeof children === "function" ? children() : children;
  return React.createElement(
    "div",
    { "data-testid": "popover-content", ...rest },
    content,
  );
};
Popover.Arrow = () =>
  React.createElement("div", { "data-testid": "popover-arrow" });
Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
const Modal = (props) => {
  const { isOpen, children, ...rest } = props || {};
  if (isOpen === false) return null;
  return React.createElement(
    "div",
    { "data-testid": "modal", ...clean(rest) },
    children,
  );
};
const ModalContent = (props) =>
  React.createElement(
    "div",
    { "data-testid": "modal-content" },
    props?.children,
  );
const ModalHeader = (props) => React.createElement("div", {}, props?.children);
const ModalBody = (props) => React.createElement("div", {}, props?.children);
const ModalFooter = (props) => React.createElement("div", {}, props?.children);
const Select = (props) => {
  const { children, onSelectionChange, selectedKeys, ...rest } = props || {};
  return React.createElement(
    "div",
    {
      "data-testid": "select",
      "data-selected": JSON.stringify(Array.from(selectedKeys || [])),
      onClick: () => onSelectionChange?.(new Set(["test"])),
      ...rest,
    },
    children,
  );
};
const SelectItem = (props) =>
  React.createElement(
    "div",
    { "data-testid": "select-item", "data-key": props?.key },
    props?.children,
  );
const Card = createMock("card");
const CardBody = (props) => React.createElement("div", {}, props?.children);
const CardHeader = (props) => React.createElement("div", {}, props?.children);
const CardFooter = (props) => React.createElement("div", {}, props?.children);
// The compound Table is a compound, collection-based component. This mock
// faithfully reproduces the render-prop collection API (Header `columns` +
// function child, Body `items` + `renderEmptyState` + function child, Row
// function child receiving each column key) as well as static children, while
// rendering real table DOM so queries like `closest("tr")` work.
const TableContext = React.createContext(null);
// NextUI (v2) Table API: <Table aria-label topContent bottomContent
// selectedKeys selectionMode onSelectionChange> with <TableHeader columns>,
// <TableBody items emptyContent isLoading loadingContent>, <TableRow>,
// <TableCell>. This mock emits the the observable DOM (table-content,
// table-column, table-row, table-cell, table-footer) the final tests expect.
const Table = (props) => {
  const {
    children,
    className,
    classNames,
    "aria-label": ariaLabel,
    topContent,
    bottomContent,
    onSelectionChange,
    selectedKeys,
    selectionMode,
  } = props || {};
  const ctxRef = React.useRef({ columnKeys: [], rowIds: [] });
  ctxRef.current.columnKeys = [];
  ctxRef.current.rowIds = [];
  const ctx = ctxRef.current;
  ctx.selectionMode = selectionMode;
  const handleClick = () => {
    if (onSelectionChange) {
      onSelectionChange(new Set(ctx.rowIds));
    }
  };
  return React.createElement(
    TableContext.Provider,
    { value: ctx },
    React.createElement(
      "div",
      {
        "data-testid": "table",
        className: classNames?.base ?? className,
        onClick: handleClick,
      },
      topContent,
      // NextUI v2 bounds the scroll/height on the `wrapper` slot (a
      // ScrollShadow), not the base. Surface it as a dedicated scroll container
      // so height/overflow can be asserted independently of the root element.
      React.createElement(
        "div",
        { "data-testid": "table-scroll", className: classNames?.wrapper },
        React.createElement(
          "table",
          {
            "data-testid": "table-content",
            "data-aria-label": ariaLabel,
            "data-selection-mode": selectionMode,
            "data-selected-keys": selectedKeys
              ? JSON.stringify(
                  selectedKeys === "all" ? "all" : Array.from(selectedKeys),
                )
              : undefined,
          },
          children,
        ),
      ),
      bottomContent ?? null,
    ),
  );
};
const TableHeader = (props) => {
  const ctx = React.useContext(TableContext);
  const { children, columns } = props || {};
  let content;
  if (typeof children === "function") {
    const cols = columns || [];
    if (ctx) {
      ctx.columnKeys = cols.map((col) => col.key ?? col.id);
    }
    content = cols.map((col) =>
      React.cloneElement(children(col), { key: col.key ?? col.id }),
    );
  } else {
    content = React.Children.toArray(children);
  }
  // react-aria designates the first column as the row header when none is
  // explicitly flagged; emulate that so exactly one column is the row header.
  if (Array.isArray(content) && content.length > 0) {
    content = content.map((col, index) =>
      index === 0 && React.isValidElement(col)
        ? React.cloneElement(col, { isRowHeader: true })
        : col,
    );
  }
  // NextUI v2 auto-renders a leading selection-checkbox column whenever a
  // selectionMode is set; mirror that so column/cell counts match.
  const selectionColumn =
    ctx && ctx.selectionMode && ctx.selectionMode !== "none"
      ? React.createElement(
          "th",
          { key: "selection", "data-testid": "table-column" },
          React.createElement("input", {
            type: "checkbox",
            "aria-label": "Select all",
            "data-testid": "table-select-all",
          }),
        )
      : null;
  return React.createElement(
    "thead",
    { "data-testid": "table-header" },
    React.createElement("tr", null, selectionColumn, content),
  );
};
const TableColumn = (props) => {
  const { children, className, isRowHeader } = props || {};
  return React.createElement(
    "th",
    {
      "data-testid": "table-column",
      className,
      "data-row-header": isRowHeader ? "true" : undefined,
    },
    children,
  );
};
const TableBody = (props) => {
  const { children, items, emptyContent, isLoading, loadingContent } =
    props || {};
  const list = items || [];
  let rows;
  if (typeof children === "function") {
    rows =
      list.length === 0
        ? null
        : list.map((item, index) =>
            React.cloneElement(children(item), { key: index }),
          );
  } else {
    rows = children;
  }
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "tbody",
      { "data-testid": "table-body" },
      list.length === 0 && emptyContent
        ? React.createElement(
            "tr",
            { "data-testid": "empty" },
            React.createElement("td", null, emptyContent),
          )
        : rows,
    ),
    isLoading && loadingContent
      ? React.createElement(
          "tfoot",
          { "data-testid": "table-footer" },
          React.createElement(
            "tr",
            null,
            React.createElement("td", null, loadingContent),
          ),
        )
      : null,
  );
};
const TableRow = (props) => {
  const ctx = React.useContext(TableContext);
  const { children, id, className } = props || {};
  if (ctx && id != null) {
    ctx.rowIds.push(id);
  }
  let content;
  if (typeof children === "function") {
    const keys = (ctx && ctx.columnKeys) || [];
    content = keys.map((key) => React.cloneElement(children(key), { key }));
  } else {
    content = children;
  }
  const selectionCell =
    ctx && ctx.selectionMode && ctx.selectionMode !== "none"
      ? React.createElement(
          "td",
          { key: "selection", "data-testid": "table-cell" },
          React.createElement("input", {
            type: "checkbox",
            "aria-label": "Select row",
            "data-testid": "table-select-row",
          }),
        )
      : null;
  return React.createElement(
    "tr",
    { "data-testid": "table-row", "data-id": id, className },
    selectionCell,
    content,
  );
};
const TableCell = (props) => {
  const { children, className } = props || {};
  return React.createElement(
    "td",
    { "data-testid": "table-cell", className },
    children,
  );
};
const getKeyValue = () => "";
const Spinner = () => React.createElement("div", { "data-testid": "spinner" });
const Tooltip = (props) =>
  React.createElement("div", { "data-testid": "tooltip" }, props?.children);
const Dropdown = (props) =>
  React.createElement("div", { "data-testid": "dropdown" }, props?.children);
const DropdownTrigger = (props) =>
  React.createElement("div", {}, props?.children);
const DropdownMenu = (props) => {
  const { children, onSelectionChange, selectedKeys } = props || {};
  return React.createElement(
    "div",
    {
      "data-testid": "dropdown-menu",
      onClick: () => onSelectionChange?.(new Set(selectedKeys || [])),
    },
    children,
  );
};
const DropdownItem = (props) =>
  React.createElement(
    "div",
    { "data-testid": "dropdown-item" },
    props?.children,
  );
const Navbar = (props) => React.createElement("div", {}, props?.children);
const NavbarBrand = (props) => React.createElement("div", {}, props?.children);
const NavbarContent = (props) =>
  React.createElement("div", {}, props?.children);
const NavbarItem = (props) => React.createElement("div", {}, props?.children);
const Link = (props) => {
  const { children, href, ...rest } = props || {};
  return React.createElement("a", { href, ...rest }, children);
};
const Divider = () => React.createElement("hr");
const Badge = (props) => {
  const { children, content, color, variant, size, ...rest } = props || {};
  return React.createElement(
    "div",
    {
      "data-testid": rest["data-testid"] || "badge",
      "data-content": content,
      "data-color": color,
      "data-variant": variant,
      "data-size": size,
      ...clean(rest),
    },
    children,
  );
};
Badge.Anchor;
Badge.Anchor = (props) => React.createElement("div", {}, props?.children);
Badge.Content = (props) => React.createElement("div", {}, props?.children);
const Avatar = () => React.createElement("div", { "data-testid": "avatar" });
const Switch = (props) => {
  const { children, isSelected, onChange, onValueChange, ...rest } =
    props || {};
  const handleClick = onChange || (() => onValueChange?.(!isSelected));
  return React.createElement(
    "div",
    {
      "data-testid": "switch",
      "data-selected": isSelected,
      ...clean(rest),
    },
    React.createElement(
      "span",
      { "data-testid": "switch-control", onClick: handleClick },
      React.createElement("span", { "data-testid": "switch-thumb" }),
    ),
    React.createElement("span", { "data-testid": "switch-content" }, children),
  );
};
Switch.Control = (props) => React.createElement("div", {}, props?.children);
Switch.Thumb = () => React.createElement("div", {});
Switch.Content = (props) => React.createElement("div", {}, props?.children);
const Label = (props) => React.createElement("span", {}, props?.children);
const Slider = createMock("slider");
const Tabs = (props) => {
  const { children, items, ...rest } = props || {};
  let content;
  if (typeof children === "function") {
    content = (items || []).map((item) => children(item));
  } else {
    content = children;
  }
  return React.createElement(
    "div",
    { "data-testid": "tabs", ...clean(rest) },
    content,
  );
};
const Tab = (props) => {
  const { children, title, ...rest } = props || {};
  return React.createElement(
    "div",
    { "data-testid": "tab", ...clean(rest) },
    title,
    children,
  );
};
Tabs.Tab = Tab;
Tabs.ListContainer = (props) => React.createElement("div", {}, props?.children);
Tabs.List = (props) => React.createElement("div", {}, props?.children);
Tabs.Panel = (props) => React.createElement("div", {}, props?.children);
Tabs.Indicator = () => React.createElement("div", {});
const Pagination = createMock("pagination");
const Progress = (props) => {
  const { children, label, isIndeterminate, size, color, className, ...rest } =
    props || {};
  const ariaLabel =
    label ?? (typeof children === "string" ? children : undefined);
  return React.createElement(
    "div",
    {
      "data-testid": "progress-bar",
      role: "progressbar",
      "aria-label": ariaLabel,
      "aria-busy": isIndeterminate ? "true" : undefined,
      "data-indeterminate": isIndeterminate ? "true" : undefined,
      "data-size": size,
      "data-color": color,
      className,
      ...rest,
    },
    children,
  );
};
const CircularProgress = createMock("circular-progress");
const Textarea = () =>
  React.createElement("textarea", { "data-testid": "textarea" });
const Listbox = (props) =>
  React.createElement("div", { "data-testid": "listbox" }, props?.children);
const ListboxItem = (props) =>
  React.createElement(
    "div",
    { "data-testid": "listbox-item" },
    props?.children,
  );
// NextUI (v2) Autocomplete is a single collection component (items + function
// child rendering AutocompleteItem). The compound equivalent is ComboBox/ListBox, so
// this mock emits the same observable DOM the component and mock produce:
// a `autocomplete` wrapper carrying the prop-derived data-* attributes, an
// `autocomplete-input` wired to onInputChange, and `item-<value>` entries.
const Autocomplete = (props) => {
  const {
    children,
    items,
    label,
    onInputChange,
    onSelectionChange,
    isDisabled,
    isInvalid,
    errorMessage,
    size,
    fullWidth,
  } = props || {};
  const list = items || [];
  const content =
    typeof children === "function"
      ? list.map((item) => children(item))
      : children;
  return React.createElement(
    AutocompleteContext.Provider,
    { value: { onSelectionChange } },
    React.createElement(
      "div",
      {
        "data-testid": "autocomplete",
        "data-label": label,
        "data-disabled": isDisabled ? "true" : undefined,
        "data-invalid": isInvalid ? "true" : undefined,
        "data-error": errorMessage ?? undefined,
        "data-size": size,
        "data-fullwidth": fullWidth != null ? String(fullWidth) : undefined,
      },
      React.createElement("input", {
        "data-testid": "autocomplete-input",
        onChange: (e) => onInputChange?.(e.target.value),
      }),
      React.createElement(
        "div",
        { "data-testid": "autocomplete-items" },
        content,
      ),
    ),
  );
};
const AutocompleteItem = (props) => {
  const ctx = React.useContext(AutocompleteContext);
  const { children, value } = props || {};
  return React.createElement(
    "div",
    {
      "data-testid": `item-${value}`,
      onClick: () => ctx?.onSelectionChange?.(value),
    },
    children,
  );
};
const DatePicker = createMock("date-picker");
const TimeInput = createMock("time-input");
const Calendar = createMock("calendar");
const Skeleton = () =>
  React.createElement("div", { "data-testid": "skeleton" });
const Spacer = () => React.createElement("div");
const Image = (props) => React.createElement("img", { alt: props?.alt || "" });
const User = (props) =>
  React.createElement("div", { "data-testid": "user" }, props?.name);
const Breadcrumbs = (props) => React.createElement("div", {}, props?.children);
const BreadcrumbItem = (props) =>
  React.createElement("div", {}, props?.children);
const Snippet = (props) =>
  React.createElement("div", { "data-testid": "snippet" }, props?.children);
const Code = (props) => React.createElement("code", {}, props?.children);
const Kbd = (props) => React.createElement("kbd", {}, props?.children);
const Alert = (props) =>
  React.createElement("div", { "data-testid": "alert" }, props?.children);
const Drawer = (props) =>
  React.createElement("div", { "data-testid": "drawer" }, props?.children);
const DrawerContent = (props) =>
  React.createElement("div", {}, props?.children);
const DrawerHeader = (props) => React.createElement("div", {}, props?.children);
const DrawerBody = (props) => React.createElement("div", {}, props?.children);
const DrawerFooter = (props) => React.createElement("div", {}, props?.children);
const CloseButton = (props) => {
  const { children, onPress, onClick, ...rest } = props || {};
  return React.createElement(
    "button",
    {
      ...rest,
      "data-testid": rest["data-testid"] || "close-button",
      onClick: onPress || onClick,
    },
    children,
  );
};
const ComboBox = (props) => {
  const { children, onInputChange, onSelectionChange, className, ...rest } =
    props || {};
  delete rest.isDisabled;
  delete rest.isInvalid;
  delete rest.fullWidth;
  delete rest.autoFocus;
  delete rest.menuTrigger;
  return React.createElement(
    ComboBoxContext.Provider,
    { value: { onInputChange, onSelectionChange } },
    React.createElement(
      "div",
      { "data-testid": rest["data-testid"] || "combobox", className, ...rest },
      children,
    ),
  );
};
ComboBox.InputGroup = (props) =>
  React.createElement("div", {}, props?.children);
ComboBox.Trigger = (props) =>
  React.createElement(
    "button",
    { "data-testid": "combobox-trigger" },
    props?.children,
  );
ComboBox.Popover = (props) => {
  const { children, className, ...rest } = props || {};
  return React.createElement("div", { className, ...rest }, children);
};
const FieldError = (props) => {
  const { children, ...rest } = props || {};
  return React.createElement(
    "div",
    { "data-testid": rest["data-testid"] || "error", ...rest },
    children,
  );
};
const InputGroup = (props) => React.createElement("div", {}, props?.children);
InputGroup.Prefix = (props) => React.createElement("div", {}, props?.children);
InputGroup.Input = (props) => {
  const ctx = React.useContext(TextFieldContext);
  const { onChange, value, type, isDisabled, disabled, ...rest } = props || {};
  const handleChange =
    onChange || (ctx ? (e) => ctx.onChange?.(e.target.value) : undefined);
  const inputProps = {
    type,
    onChange: handleChange,
    disabled: isDisabled ?? disabled,
    "data-testid": rest["data-testid"] || "input",
    ...rest,
  };
  if (value !== undefined) {
    inputProps.value = value;
  } else if (ctx) {
    inputProps.value = ctx.value ?? "";
  }
  return React.createElement("input", inputProps);
};
const ListBox = (props) => {
  const { children, items, ...rest } = props || {};
  let content;
  if (typeof children === "function") {
    content = (items || []).map((item) => children(item));
  } else {
    content = children;
  }
  return React.createElement(
    "div",
    { "data-testid": rest["data-testid"] || "listbox", ...rest },
    content,
  );
};
ListBox.Item = (props) => {
  const ctx = React.useContext(ComboBoxContext);
  const { children, id, ...rest } = props || {};
  delete rest.textValue;
  return React.createElement(
    "div",
    {
      "data-testid": `item-${id}`,
      onClick: () => ctx?.onSelectionChange?.(id),
      ...rest,
    },
    children,
  );
};
const ProgressBar = (props) => {
  const { children, label, isIndeterminate, size, color, className, ...rest } =
    props || {};
  const ariaLabel =
    label ?? (typeof children === "string" ? children : undefined);
  return React.createElement(
    "div",
    {
      "data-testid": "progress-bar",
      role: "progressbar",
      "aria-label": ariaLabel,
      "aria-busy": isIndeterminate ? "true" : undefined,
      "data-indeterminate": isIndeterminate ? "true" : undefined,
      "data-size": size,
      "data-color": color,
      className,
      ...rest,
    },
    children,
  );
};
const ScrollShadow = (props) => {
  const { children, className, ...rest } = props || {};
  return React.createElement(
    "div",
    { "data-testid": "scroll-shadow", className, ...rest },
    children,
  );
};
const Separator = (props) => {
  const { ...rest } = props || {};
  return React.createElement("hr", { "data-testid": "separator", ...rest });
};
const TextField = (props) => {
  const { children, value, onChange, isInvalid, ...rest } = props || {};
  const testId = rest["data-testid"] || "textfield";
  return React.createElement(
    TextFieldContext.Provider,
    { value: { value, onChange } },
    React.createElement(
      "div",
      {
        ...rest,
        "data-testid": testId,
        "data-invalid": isInvalid ? "true" : undefined,
      },
      children,
    ),
  );
};

const useButton = (opts) => {
  const { onPress } = opts || {};
  return { getButtonProps: () => ({ onClick: onPress }) };
};
const NextUIProvider = (props) =>
  React.createElement(React.Fragment, null, props?.children);

module.exports = {
  CheckboxGroup,
  Checkbox,
  Input,
  Radio,
  RadioGroup,
  Chip,
  Button,
  ButtonGroup,
  Accordion,
  AccordionItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  getKeyValue,
  Spinner,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Divider,
  Badge,
  Avatar,
  Switch,
  Label,
  Slider,
  Tabs,
  Tab,
  Pagination,
  Progress,
  CircularProgress,
  Textarea,
  Listbox,
  ListboxItem,
  Autocomplete,
  AutocompleteItem,
  DatePicker,
  TimeInput,
  Calendar,
  Skeleton,
  Spacer,
  Image,
  User,
  Breadcrumbs,
  BreadcrumbItem,
  Snippet,
  Code,
  Kbd,
  Alert,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  CloseButton,
  ComboBox,
  useButton,
  NextUIProvider,
  FieldError,
  InputGroup,
  ListBox,
  ProgressBar,
  ScrollShadow,
  Separator,
  TextField,
};
