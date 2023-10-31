import "./index.less";

import React, { useMemo } from "react";
import { Modal } from "antd";
import { differenceInCalendarDays, format } from "date-fns/fp";
import { RoomInfo, Week } from "../../types/room";
import { formatInviteCode, getWeekNames } from "../../utils/room";
import { useLanguage, useTranslate } from "@netless/flat-i18n";

const completeTimeFormat = /* @__PURE__ */ format("yyyy-MM-dd HH:mm");
const onlySuffixTimeFormat = /* @__PURE__ */ format("HH:mm");

export interface InviteModalProps {
    visible: boolean;
    room: RoomInfo;
    userName: string;
    baseUrl: string;
    // repeated weeks for periodic rooms
    periodicWeeks?: Week[];
    onCopy: (text: string) => void;
    onCancel: () => void;
    pmi?: string | null;
}

export const InviteModal: React.FC<InviteModalProps> = ({
    visible,
    room,
    periodicWeeks,
    userName,
    baseUrl,
    pmi,
    onCopy,
    onCancel,
}) => {
    const t = useTranslate();
    const language = useLanguage();
    const { beginTime, endTime, periodicUUID, roomUUID, inviteCode, title } = room;
    const uuid = periodicUUID || roomUUID;
    const joinLink = `${baseUrl}/join/${inviteCode === pmi ? inviteCode : uuid}`;

    const formattedTimeRange = useMemo<string>(() => {
        if (!beginTime || !endTime) {
            return "";
        }

        const formatBeginTime = completeTimeFormat(beginTime);
        const formatEndTime =
            differenceInCalendarDays(beginTime, endTime) === 0
                ? onlySuffixTimeFormat(endTime)
                : completeTimeFormat(endTime);

        return `${formatBeginTime}~${formatEndTime}`;
    }, [beginTime, endTime]);

    const onCopyClicked = (): void => {
        const basePrefixText =
            t("invite-prefix", { userName, title }) +
            "\n" +
            (formattedTimeRange ? t("invite-begin-time", { time: formattedTimeRange }) : "");
        const baseSuffixText =
            "\n" +
            "\n" +
            t("invite-suffix", { uuid: formatInviteCode(uuid, inviteCode) }) +
            "\n" +
            t("invite-join-link", { link: `${baseUrl}/join/${uuid}` });

        if (periodicUUID) {
            const content = periodicWeeks
                ? t("repeat-weeks", { weeks: getWeekNames(periodicWeeks, language) })
                : "";

            onCopy(`${basePrefixText}${content}${baseSuffixText}`);
        } else {
            onCopy(`${basePrefixText}${baseSuffixText}`);
        }
    };

    return (
        <Modal
            cancelText={t("cancel")}
            className="invite-modal"
            okText={t("copy")}
            open={visible}
            width={460}
            onCancel={onCancel}
            onOk={onCopyClicked}
        >
            <div className="invite-modal-header">
                <span>{t("invite-title", { userName })}</span>
                <span>{t("join-and-book-by-room-uuid")}</span>
            </div>
            <div className="invite-modal-content">
                <div className="invite-modal-content-item">
                    <span>{t("room-theme")}</span>
                    <span className="invite-modal-content-title">{title}</span>
                </div>
                <div className="invite-modal-content-item">
                    <span>{t("room-uuid")}</span>
                    <span style={{ userSelect: "text" }}>{formatInviteCode(uuid, inviteCode)}</span>
                </div>
                {formattedTimeRange && (
                    <div className="invite-modal-content-item">
                        <span>{t("begin-time")}</span>
                        <span>{formattedTimeRange}</span>
                    </div>
                )}
                <div className="invite-modal-content-item">
                    <span>{t("join-link")}</span>
                    <span style={{ userSelect: "text" }}>{joinLink}</span>
                </div>
            </div>
        </Modal>
    );
};
