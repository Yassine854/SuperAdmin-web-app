import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Modal from '../../components/CreateModal'; // Ensure this component is for handling form submissions
import axios from '../../axios';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

export default function SliderAdmin() {
    const { id } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', image: null });
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [sliders, setSliders] = useState([]);
    const [pending, setPending] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [selectedSlider, setSelectedSlider] = useState(null);
    const [adminName, setAdminName] = useState('');


    const fetchSliders = async () => {
        try {
          const response = await axios.get(`/sliders/${id}`);
          setSliders(response.data.sliders);
          setAdminName(response.data.admin.name);
          setPending(false);
        } catch (error) {
          console.error('Error fetching sliders:', error);
        }
      };

    useEffect(() => {

        fetchSliders();
      }, [id]);

    useEffect(() => {
        // Reset form data and errors when modal opens or closes
        if (!isModalOpen) {
            setFormData({ title: '', description: '', image: null });
            setTitleError('');
            setDescriptionError('');
            setEditMode(false);
            setSelectedSlider(null);
        } else if (editMode && selectedSlider) {
            // Pre-fill form data if in edit mode
            setFormData({
                title: selectedSlider.title,
                description: selectedSlider.description,
                image: null,
            });
        }
    }, [isModalOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, description, image } = formData;
        const body = {
            title,
            description,
        };
        const formDataToSend = new FormData();
        formDataToSend.append('title', title);
        formDataToSend.append('description', description);
        if (image) {
            formDataToSend.append('image', image);
        }

        try {
            if (editMode && selectedSlider) {
                // Update existing slider
                const resp = await axios.put(`/sliders/update/${selectedSlider._id}`, formDataToSend);
                if (resp.status === 200) {
                    fetchSliders();
                    setAlertMessage("Slider updated successfully.");
                    setTimeout(() => {
                        setAlertMessage('');
                    }, 3000);
                }
            } else {
                // Create new slider
                const resp = await axios.post(`sliders/create/${id}`, formDataToSend);
                if (resp.status === 201) {
                    fetchSliders();
                    setAlertMessage("Slider created successfully.");
                    setTimeout(() => {
                        setAlertMessage('');
                    }, 3000);
                }
            }
            setIsModalOpen(false); // Close modal after successful submission
        } catch (error) {
            if (error.response && error.response.status === 422) {
                const errors = error.response.data.errors;
                setTitleError(errors.title ? errors.title[0] : '');
                setDescriptionError(errors.description ? errors.description[0] : '');
            }
        }
    };

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({ ...formData, [name]: files ? files[0] : value });
    };

    const handleEdit = (slider) => {
        setSelectedSlider(slider);
        setEditMode(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (_id) => {
        try {
            Swal.fire({
                title: "Are you sure?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await axios.delete(`/sliders/delete/${_id}`);
                    fetchSliders();
                    setAlertMessage("Slider deleted successfully.");
                    setTimeout(() => {
                        setAlertMessage('');
                    }, 3000);
                }
            });
        } catch (error) {
            console.error('Error deleting slider:', error);
        }
    };

    const columns = [
        {
            name: 'ID',
            selector: (row) => row._id,
            sortable: true,
        },
        {
            name: 'Title',
            selector: (row) => row.title,
            sortable: true,
        },
        {
            name: 'Description',
            selector: (row) => row.description,
            sortable: true,
        },
        {
            name: 'Image',
            cell: (row) => (
                <img src={`storage/${row.image}`} alt={row.title} style={{ width: '100px', height: 'auto' }} />
            ),
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleEdit(row)}
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                    >
                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(row._id)}
                        className="text-red-600 hover:text-red-800 flex items-center"
                    >
                        <FontAwesomeIcon icon={faTrash} className="mr-2" />
                        Delete
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
                title={editMode ? "Edit Slider" : "Add Slider"}
                onSubmit={handleSubmit}
                footer={(
                    <>
                        <button
                            type="submit"
                            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            {editMode ? 'Update' : 'Add'}
                        </button>
                        <button
                            type="button"
                            className="ml-3 bg-gray-100 transition duration-150 ease-in-out text-gray-600 hover:border-gray-400 hover:bg-gray-300 border rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 dark:hover:border-gray-500"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </button>
                    </>
                )}
            >
                <div>
                    <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Slider Title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    {titleError && <p className="text-sm text-red-600">{titleError}</p>}
                </div>
                <div>
                    <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Description
                    </label>
                    <textarea
                        name="description"
                        id="description"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        placeholder="Slider Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                    {descriptionError && <p className="text-sm text-red-600">{descriptionError}</p>}
                </div>
                <div>
                    <label
                        htmlFor="image"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                        Image
                    </label>
                    <input
                        type="file"
                        name="image"
                        id="image"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                        onChange={handleChange}
                    />
                </div>
            </Modal>

            <button
                className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center light:bg-blue-600 light:hover:bg-blue-700 light:focus:ring-blue-800 mb-4"
                onClick={() => setIsModalOpen(true)}
            >
                Add Slider
            </button>

            <DataTable
                title={adminName}
                columns={columns}
                data={sliders}
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
