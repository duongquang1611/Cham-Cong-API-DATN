import React, { memo, useState } from "react";
import {
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ButtonGroup,
  Button,
} from "reactstrap";
import "./DropDownButtonView.css";

const DropDownButtonView = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => {
    setIsOpen(!isOpen);
  };
  const toggle2 = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return (
    <div className="containerDropDown">
      <ButtonDropdown isOpen={isOpen} toggle={toggle}>
        <DropdownToggle caret color="primary">
          Button
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Header</DropdownItem>
          <DropdownItem disabled>Action</DropdownItem>
          <DropdownItem>Another Action</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Another Action</DropdownItem>
        </DropdownMenu>
      </ButtonDropdown>
      <ButtonGroup>
        <Button>1</Button>
        <Button>2</Button>
        <ButtonDropdown isOpen={dropdownOpen} toggle={toggle2}>
          <DropdownToggle caret>Dropdown</DropdownToggle>
          <DropdownMenu>
            <DropdownItem>Dropdown Link</DropdownItem>
            <DropdownItem>Dropdown Link</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      </ButtonGroup>
    </div>
  );
});

export default DropDownButtonView;
