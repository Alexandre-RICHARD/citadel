export type InternalMessagesModelAttributes = {
  i_id_internal_message: number;
  i_send_at: Date;
  i_read_at: Date | null;
  i_message_content: string;
  i_id_user_receiver: number;
  i_id_user_sender: number;
};
