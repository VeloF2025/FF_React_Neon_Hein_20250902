import { Calendar, Clock, Video, MapPin, Users, ChevronRight, CheckCircle, Link, Edit, Trash2 } from 'lucide-react';
import type { Meeting } from '../types/meeting.types';
import { getMeetingTypeColor, getStatusColor } from '../utils/meetingUtils';

interface MeetingsListProps {
  meetings: Meeting[];
  onEditMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (meetingId: string) => void;
}

export function MeetingsList({ meetings, onEditMeeting, onDeleteMeeting }: MeetingsListProps) {
  if (meetings.length === 0) {
    return (
      <div className="ff-card">
        <div className="p-8 text-center text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No meetings found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div key={meeting.id} className="ff-card hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{meeting.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getMeetingTypeColor(meeting.type)}`}>
                    {meeting.type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(meeting.status)}`}>
                    {meeting.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{meeting.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{meeting.time} ({meeting.duration})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.isVirtual ? (
                      <>
                        <Video className="w-4 h-4" />
                        <span>Virtual Meeting</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>{meeting.location}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{meeting.participants.length} participants</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Agenda:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {meeting.agenda.slice(0, 2).map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                    {meeting.agenda.length > 2 && (
                      <li className="text-gray-500 italic">+{meeting.agenda.length - 2} more items</li>
                    )}
                  </ul>
                </div>

                {meeting.actionItems.length > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">
                      {meeting.actionItems.filter(a => a.completed).length}/{meeting.actionItems.length} action items completed
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {meeting.isVirtual && meeting.meetingLink && (
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Link className="w-4 h-4 text-blue-500" />
                  </button>
                )}
                <button 
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => onEditMeeting(meeting)}
                >
                  <Edit className="w-4 h-4 text-gray-500" />
                </button>
                <button 
                  className="p-2 hover:bg-gray-100 rounded"
                  onClick={() => onDeleteMeeting(meeting.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}