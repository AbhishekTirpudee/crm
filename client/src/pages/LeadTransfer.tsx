import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useCRM } from '../contexts/CRMContext';
import { useAuth } from '../contexts/AuthContext';
import API from '../services/api';

export const LeadTransfer: React.FC = () => {
    const { leads, refreshData } = useCRM();
    const { user } = useAuth();
    const [sourceUserId, setSourceUserId] = useState<string>('');
    const [targetUserId, setTargetUserId] = useState<string>('');
    const [salesPersons, setSalesPersons] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await API.get('/auth/users');
                // Filter users who have 'sales' or 'admin' role, or just all users for now
                // Assuming 'sales' role exists, but for now we list all to ensure data appears
                setSalesPersons(res.data.map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}` })));
            } catch (error) {
                console.error("Failed to fetch users", error);
            }
        };
        fetchUsers();
    }, []);

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const { draggableId } = result;
        const leadId = draggableId;
        const newOwnerId = result.destination.droppableId;

        // Optimistic UI update or wait for API
        try {
            await API.put(`/leads/${leadId}/transfer`, { salesPersonId: newOwnerId });
            // refresh leads
            refreshData();
            // alert(`Lead transferred!`); (Optional: removed alert for smoother UX, or use toast)
        } catch (error) {
            console.error("Transfer failed", error);
            alert("Transfer failed");
        }
    };

    // Filter leads for source user
    const sourceLeads = leads.filter(l => (l as any).salesPersonId === sourceUserId || (!sourceUserId && !(l as any).salesPersonId));

    return (
        <div className="lead-transfer">
            <div className="settings-header">
                <h2>Transfer Leads</h2>
            </div>

            <div className="lead-transfer-container">
                <div className="transfer-group">
                    <div className="transfer-controls">
                        <div className="form-group">
                            <label>From Sales Person</label>
                            <select
                                value={sourceUserId}
                                onChange={(e) => setSourceUserId(e.target.value)}
                                className="form-input"
                            >
                                <option value="">Unassigned</option>
                                {salesPersons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        <div className="transfer-arrow">➡️</div>

                        <div className="form-group">
                            <label>To Sales Person</label>
                            <select
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                className="form-input"
                            >
                                <option value="">Select Target...</option>
                                {salesPersons.filter(p => p.id !== sourceUserId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className="lead-transfer-container">
                            {/* Source Column */}
                            <div className="transfer-column">
                                <h3 className="mb-3">Source Leads ({sourceLeads.length})</h3>
                                <Droppable droppableId={sourceUserId || "unassigned"}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="droppable-area"
                                        >
                                            {sourceLeads.map((lead, index) => (
                                                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="draggable-item"
                                                        >
                                                            <p className="font-medium">{lead.name}</p>
                                                            <p className="text-sm text-secondary">{lead.email}</p>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>

                            {/* Target Column (Drop Zone) */}
                            <div className={`transfer-column ${targetUserId ? 'target' : ''}`}>
                                <h3 className="mb-3">Target: {salesPersons.find(p => p.id === targetUserId)?.name || "Select User"}</h3>
                                <Droppable droppableId={targetUserId || "target-disabled"} isDropDisabled={!targetUserId}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="droppable-area flex-center"
                                        >
                                            {provided.placeholder}
                                            {sourceLeads.length === 0 && <p className="text-muted">Drop leads here</p>}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        </div>
                    </DragDropContext>
                </div>
            </div>
        </div>
    );
};
