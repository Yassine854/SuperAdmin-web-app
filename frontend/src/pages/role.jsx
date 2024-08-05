import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Modal from '../components/CreateModal';
import axios from '../axios';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'


export default function Role() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '' }); // Only name is needed
    const [nameError, setNameError] = useState('');
    const [roles, setRoles] = useState([]); // State to store roles
    const [pending, setPending] = useState(true);
    const [alertMessage, setAlertMessage] = useState(''); // State to store alert message
    const [selectedRole, setSelectedRole] = useState(null); // State for selected role for editing

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/roles');
            setRoles(response.data); // Assuming response.data is the array of roles
            setPending(false);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "btn btn-success",
          cancelButton: "btn btn-danger"
        },
        buttonsStyling: false
      });

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        // Reset form data and errors when modal opens or closes
        if (!isModalOpen) {
            setFormData({ name: '' });
            setNameError('');
            setSelectedRole(null); // Clear selected role when modal closes
        } else if (isEditing && selectedRole) {
            setFormData({ name: selectedRole.name });
        }
    }, [isModalOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name } = formData;
        const body = { name };

        try {
            let resp;
            if (isEditing) {
                resp = await axios.put(`/roles/update/${selectedRole._id}`, body);
                setAlertMessage('Le rôle a été modifié.');
            } else {
                resp = await axios.post('/roles/create', body);
                setAlertMessage('Le rôle a été ajouté.');
            }

            if (resp.status === (isEditing ? 200 : 201)) { // 200 OK for update, 201 Created for create
                fetchRoles();


            // Set a timeout to clear the alert message after 3 seconds
            setTimeout(() => {
                setAlertMessage('');
            }, 3000);
                setIsModalOpen(false); // Close modal after successful submission

            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 422) {
                    const errors = error.response.data.errors;
                    setNameError(errors.name ? errors.name[0] : '');
                }
            } else {
                console.error('Error saving role:', error);
            }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (role) => {
        setSelectedRole(role);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (_id) => {


        Swal.fire({
            title: "Êtes-vous sûre",
            text: "Vous ne pourrez pas revenir en arrière !",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, Supprimer!"
          }).then((result) => {
            if (result.isConfirmed) {
                try {
                    axios.delete(`/roles/delete/${_id}`);
                    fetchRoles();
                    setAlertMessage('Le rôle a été supprimé.');

                    // Set a timeout to clear the alert message after 3 seconds
                    setTimeout(() => {
                        setAlertMessage('');
                    }, 3000);
                        setIsModalOpen(false); // Close modal after successful submission

                } catch (error) {
                    console.error('Error deleting role:', error);
                }
                fetchRoles();
            }
          });


    };

    const modalFooter = (
        <>
            <button
                type="submit"
                className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                {isEditing ? 'Modifier' : 'Ajouter'}
            </button>
            <button
                type="button"
                className="ml-3 bg-gray-100 transition duration-150 ease-in-out text-gray-600 hover:border-gray-400 hover:bg-gray-300 border rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:hover:border-gray-500"
                onClick={() => setIsModalOpen(false)}
            >
                Annuler
            </button>
        </>
    );

    const columns = [
        {
            name: 'ID',
            selector: (row) => row._id, // Adjust if ID field is different
            sortable: true,
        },
        {
            name: 'Rôle',
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex items-center space-x-4">
    <button
      onClick={() => handleEdit(row)}
      className="text-blue-600 hover:text-blue-800 flex items-center"
    >
      <FontAwesomeIcon icon={faEdit} className="mr-2" />
      Modifier
    </button>

    <button
      onClick={() => handleDelete(row._id)}
      className="text-red-600 hover:text-red-800 flex items-center"
    >
      <FontAwesomeIcon icon={faTrash} className="mr-2" />
      Supprimer
    </button>
  </div>
            ),
        },
    ];

    const customStyles = {
        headRow: {
            style: {
                border: 'none',
            },
        },
        headCells: {
            style: {
                color: '#202124',
                fontSize: '14px',
                fontWeight: 'bold',
            },
        },
        rows: {
            style: {
                minHeight: '56px',
            },
            highlightOnHoverStyle: {
                backgroundColor: 'rgb(230, 244, 244)',
                borderBottomColor: '#FFFFFF',
                borderRadius: '25px',
                outline: '1px solid #FFFFFF',
            },
        },
        pagination: {
            style: {
                border: 'none',
            },
        },
    };

    return (
        <>
            {alertMessage && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
                    <p className="font-bold">{alertMessage}</p>
                </div>
            )}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isEditing ? "Modifier Rôle" : "Ajouter Rôle"}
                onSubmit={handleSubmit}
                footer={modalFooter}
            >
                <div>
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Rôle
                    </label>
                    <input
                        type="text"
                        name="name"
                        id="name"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Nom du rôle"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    {nameError && <p className="text-sm text-red-600">{nameError}</p>}
                </div>
            </Modal>

            <button
                className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mb-4"
                onClick={() => {
                    setIsEditing(false);
                    setIsModalOpen(true);
                }}
            >
                Ajouter Rôle
            </button>

            <DataTable
                title="Rôles"
                columns={columns}
                data={roles}
                customStyles={customStyles}
                highlightOnHover
                pointerOnHover
                pagination
                responsive
                progressPending={pending}
            />
        </>
    );
}
