/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from "react";

const PickupOptions = ({ selected, setSelected, branches }) => {

    const selectPickup = (value) => {
        setSelected(value);
    }

    if (branches.length === 1)
    {
        let singleBranch = branches[0];
        selectPickup(singleBranch.id);
        return '';
    }

    return (
        <div className="d-flex mt-3 justify-content-center flex-wrap">
            {branches.map((branch) => {
                const selectedStyles = selected !== branch.id ? {
                    color: "#fbaf02",
                    backgroundColor: "#FFF", border: "1px solid #fbaf02"
                } : {
                    color: "#fff",
                        backgroundColor: "#fbaf02",
                    };
                return (
                    <div
                        key={branch.id}
                        onClick={() => selectPickup(branch.id)}
                        className="d-inline-block"
                        style={{
                            cursor: "pointer",
                            ...selectedStyles,
                            padding: 10,
                            paddingLeft: 20,
                            paddingRight: 20,
                            borderRadius: 30,
                            marginRight: 10,
                            marginBottom: 10,
                            fontWeight: "bold"
                        }}
                    >
                        {branch.city} - {branch.streetName}
                    </div>
                );
            })}
        </div>
    );
};


export default PickupOptions;