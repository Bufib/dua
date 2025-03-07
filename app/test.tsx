import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  addPrayerToFavorites,
  isPrayerInFavorites,
  removePrayerFromFavorites,
} from "@/utils/initializeDatabase";
import { useRefreshFavorites } from "@/stores/refreshFavoriteStore";
import { removeFavoriteToast, addFavoriteToast } from "@/constants/messages";




const PrayerDisplay = ({ 
  prayerId = 1,
  title = "Dua Before Sleeping",
  arabicTitle = "دعاء قبل النوم",
  introduction = "This dua is recommended to recite before sleeping. The Prophet Muhammad (peace be upon him) would recite this supplication before going to bed. It offers protection during sleep and remembrance of Allah before resting.",
  prayerText = `
  اَلسَّلاَمُ عَلَيْكَ يَا أَبَا عَبْدِ ٱللَّهِ
alssalamu \´alayka ya aba \´abdillahi
Peace be upon you, O Abu-\´Abdullah.

اَلسَّلاَمُ عَلَيْكَ يَا بْنَ رَسُولِ ٱللَّهِ
alssalamu \´alayka yabna rasuli allahi
Peace be upon you, O son of Allah’s Messenger.
 

السَّلاَمُ عَلَيكَ يَا خِيَرَةِ ٱللَّهِ وَٱبْنَ خَيرَتِهِ
alssalamu \´alayka ya khiyarata allahi wabna khiyaratihi
Peace be upon you, O choicest of Allah and son of His choicest.

اَلسَّلاَمُ عَلَيْكَ يَا بْنَ أَمِيرِ ٱلْمُؤْمِنِينَ
alssalamu \´alayka yabna amiri almu'minina
Peace be upon you, O son of the Commander of the Faithful

وَٱبْنَ سَيِّدِ ٱلْوَصِيِّينَ
wabna sayyidi alwasiyyina
and son of the chief of the Prophets’ successors.

اَلسَّلاَمُ عَلَيْكَ يَا بْنَ فَاطِمَةَ
alssalamu \´alayka yabna fatimata
Peace be upon you, O son of Fatimah

سَيِّدَةِ نِسَاءِ ٱلْعَالَمِينَ
sayyidati nisa'i al\´alamina
the doyenne of the women of the worlds.

اَلسَّلاَمُ عَلَيْكَ يَا ثَارَ ٱللَّهِ وَٱبْنَ ثَارِهِ وَٱلْوِتْرَ ٱلْمَوْتُورَ
alssalamu \´alayka ya thara allahi wabna tharihi walwitra almawtura
Peace be upon you, O vengeance of Allah, son of His vengeance, and the unavenged so far.

اَلسَّلاَمُ عَلَيْكَ وَعَلَىٰ ٱلأَرْوَاحِ ٱلَّتِي حَلَّتْ بِفِنَائِكَ
alssalamu \´alayka wa \´ala al-arwahi allati hallat bifina'ika
Peace be upon you and upon the souls that resided in your courtyard.

عَلَيْكُمْ مِنِّي جَمِيعاً سَلاَمُ ٱللَّهِ أَبَداً
\´alaykum minni jami\´an salamu allahi abadan
Peace of Allah be upon all of you from me forever

مَا بَقيتُ وَبَقِيَ ٱللَّيْلُ وَٱلنَّهَارُ
ma baqitu wa baqiya allaylu walnnaharu
as long as I am existent and as long as there are day and night.

يَا أَبَا عَبْدِ ٱللَّهِ
ya aba \´abdillahi
O Abu-\´Abdullah,

لَقَدْ عَظُمَتِ ٱلرَّزِيَّةُ
laqad \´azumat alrraziyyatu
unbearable is the sorrow

وَجَلَّتْ وَعَظُمَتِ ٱلْمُصيبَةُ بِكَ
wa jallat wa \´azumat almusibatu bika
and excruciating and unbearable is the misfortune of you

عَلَيْنَا وَعَلَىٰ جَمِيعِ أَهْلِ ٱلإِسْلاَمِ
\´alayna wa \´ala jami\´i ahli al-islami
for us and for all the people of Islam.

وَجَلَّتْ وَعَظُمَتْ مُصيبَتُكَ
wa jallat wa \´azumat musibatuka
Excruciating and unbearable has been your misfortune

فِي ٱلسَّمَاوَاتِ عَلَىٰ جَمِيعِ أَهْلِ ٱلسَّمَاوَاتِ
fi alssamawati \´ala jami\´i ahli alssamawati
in the heavens for all the inhabitants of the heavens.

فَلَعَنَ ٱللَّهُ أُمَّةً أَسَّسَتْ أَسَاسَ ٱلظُّلْمِ وَٱلْجَوْرِ عَلَيْكُمْ أَهْلَ ٱلْبَيْتِ
fala\´ana allahu ummatan assasat asasa alzzulmi waljawri \´alaykum ahla albayti
So, may Allah curse the people who laid the basis of persecution and wronging against you, O Members of the Household.

وَلَعَنَ ٱللَّهُ أُمَّةً دَفَعَتْكُمْ عَنْ مَقَامِكُمْ
wa la\´ana allahu ummatan dafa\´atkum \´an maqamikum
May Allah curse the people who drove you away from your position

وَأَزَالَتْكُمْ عَنْ مَرَاتِبِكُمُ ٱلَّتِي رَتَّبَكُمُ ٱللَّهُ فِيهَا
wa azalatkum \´an maratibikum allati rattabakum allahu fiha
and removed you away from your ranks that Allah has put you in.

وَلَعَنَ ٱللَّهُ أُمَّةً قَتَلَتْكُمْ
wa la\´ana allahu ummatan qatalatkum
May Allah curse the people who slew you.

وَلَعَنَ ٱللَّهُ ٱلْمُمَهِّدِينَ لَهُمْ
wa la\´ana allahu almumahhidina lahum
May Allah curse those who paved the way for them to do so

بِٱلتَّمْكِينِ مِنْ قِتَالِكُمْ
bilttamkini min qitalikum
and who made possible for them to fight against you.

بَرِئْتُ إِلَىٰ ٱللَّهِ وَإِلَيْكُمْ مِنْهُمْ
bari'tu ila allahi wa ilaykum minhum
I repudiate them in the presence of Allah and You

وَمِنْ أَشْيَاعِهِمْ وَأَتْبَاعِهِمْ وَأَوْلِيَائِهِمْ
wa min ashya\´ihim wa atba\´ihim wa awliya'ihim
and I repudiate their devotees, followers, and loyalists.

يَا أَبَا عَبْدِ ٱللَّهِ
ya aba \´abdillahi
O Abu-\´Abdullah,

إِنِّي سِلْمٌ لِمَنْ سَالَمَكُمْ
inni silmun liman salamakum
I am at peace with those who are at peace with you

وَحَرْبٌ لِمَنْ حَارَبَكُمْ إِلَىٰ يَوْمِ ٱلْقِيَامَةِ
wa harbun liman harabakum ila yawmi alqiyamati
and I am at war against those who have fought against you up to the Resurrection Day.

وَلَعَنَ ٱللَّهُ آلَ زِيَادٍ وَآلَ مَرْوَانَ
wa la\´ana allahu ala ziyadin wa ala marwana
May Allah also curse the family of Ziyad and the family of Marwan.

وَلَعَنَ ٱللَّهُ بَنِي أُمَيَّةَ قَاطِبَةً
wa la\´ana allahu bani umayyata qatibatan
May Allah also curse the descendants of Umayyah altogether.

وَلَعَنَ ٱللَّهُ ٱبْنَ مَرْجَانَةَ
wa la\´ana allahu ibna marjanata
May Allah also curse the son of Marjanah.

وَلَعَنَ ٱللَّهُ عُمَرَ بْنَ سَعْدٍ
wa la\´ana allahu \´umara bna sa\´din
May Allah also curse \´Umar the son of Sa\´d.

وَلَعَنَ ٱللَّهُ شِمْراً
wa la\´ana allahu shimran
May Allah also curse Shimr.

وَلَعَنَ ٱللَّهُ أُمَّةً أَسْرَجَتْ وَأَلْجَمَتْ
wa la\´ana allahu ummatan asrajat wa aljamat
May Allah also curse the people who saddled up, gave reins to their horses,

وَتَنَقَّبَتْ لِقِتَالِكَ
wa tanaqqabat liqitalika
and masked their faces in preparation for fighting against you.

بِأَبِي أَنْتَ وَأُمِّي
bi'abi anta wa ummi
May my father and mother be ransoms for you.

لَقَدْ عَظُمَ مُصَابِي بِكَ
laqad \´azuma musabi bika
Extremely insufferable is my commiserations with you;

فَأَسْأَلُ ٱللَّهَ ٱلَّذِي أَكْرَمَ مَقَامَكَ وَأَكْرَمَنِي بِكَ
fa'as'alu allaha alladhi akrama maqamaka wa akramani bika
so, I beseech Allah Who has honored your position and honored me because of you

أَنْ يَرْزُقَنِي طَلَبَ ثَأْرِكَ
an yarzuqani talaba tha'rika
to endue me with the chance to avenge you

مَعَ إِمَامٍ مَنْصُورٍ مِنْ أَهْلِ بَيْتِ مُحَمَّدٍ
ma\´a imamin mansurin min ahli bayti muhammadin
with a (Divinely) supported leader from the Household of Muhammad,

صَلَّىٰ ٱللَّهُ عَلَيْهِ وَآلِهِ
salla allahu \´alayhi wa alihi
peace of Allah be upon him and his Household.

اَللَّهُمَّ ٱجْعَلْنِي عِنْدَكَ وَجِيهاً
allahumma ij\´alni \´indaka wajihan
O Allah, (please) make me illustrious in Your sight

بِٱلْحُسَيْنِ عَلَيْهِ ٱلسَّلاَمُ فِي ٱلدُّنْيَا وَٱلآخِرَةِ
bilhusayni \´alayhi alssalamu fi alddunya wal-akhirati
in the name of al-Husayn, peace be upon him, in this world and in the Hereafter.

يَا أَبَا عَبْدِ ٱللَّهِ
ya aba \´abdillahi
O Abu-\´Abdullah,

إِنِّي أَتَقَرَّبُ إِلَىٰ ٱللَّهِ وَإِلَىٰ رَسُولِهِ
inni ataqarrabu ila allahi wa ila rasulihi
I do seek nearness to Allah, to His Messenger,

وَإِلَىٰ أَمِيرِ ٱلْمُؤْمِنِينَ وَإِلَىٰ فَاطِمَةَ
wa ila amiri almu'minina wa ila fatimata
to the Commander of the Faithful, to Fatimah,

وَإِلَىٰ ٱلْحَسَنِ وَإِلَيْكَ بِمُوَالاَتِكَ
wa ila alhasani wa ilayka bimuwalatika
to al-Hasan, and to you by means of loyalty to you

وَبِٱلْبَرَاءَةِ (مِمَّنْ قَاتَلَكَ
wa bilbara'ati (mimman qatalaka
and by means of repudiation of those who fought against you

وَنَصَبَ لَكَ ٱلْحَرْبَ
wa nasaba laka alharba
and incurred your hostility,

وَبِٱلْبَرَاءَةِ مِمَّنْ أَسَّسَ أَسَاسَ ٱلظُّلْمِ وَٱلْجَوْرِ عَلَيْكُمْ
wa bilbara'ati mimman assasa asasa alzzulmi waljawri \´alaykum
and repudiation of those who laid the basis of persecution and wronging against you all.

وَأَبْرَأُ إِلَىٰ ٱللَّهِ وَإِلَىٰ رَسُولِهِ)
wa abra'u ila allahi wa ila rasulihi)
I also repudiate, in the presence of Allah and His Messenger,

مِمَّنْ أَسَّسَ أَسَاسَ ذٰلِكَ
mimman assasa asasa dhalika
those who laid the basis of all that,

وَبَنَىٰ عَلَيْهِ بُنْيَانَهُ
wa bana \´alayhi bunyanahu
established their foundations on it,

وَجَرَىٰ فِي ظُلْمِهِ وَجَوْرِهِ عَلَيْكُمْ وَعلىٰ أَشْيَاعِكُمْ
wa jara fi zulmihi wa jawrihi \´alaykum wa \´ala ashya\´ikum
and continued in wronging and persecuting you and your adherents.

بَرِئْتُ إِلَىٰ ٱللَّهِ وَإِلَيْكُمْ مِنْهُمْ
bari'tu ila allahi wa ilaykum minhum
In the presence of Allah and you all do I repudiate these.

وَأَتَقَرَّبُ إِلَىٰ ٱللَّهِ ثُمَّ إِلَيْكُمْ
wa ataqarrabu ila allahi thumma ilaykum
And I seek nearness to Allah and then to you all

بِمُوَالاَتِكُمْ وَمُوَالاَةِ وَلِيِّكُمْ
bimuwalatikum wa muwalati waliyyikum
by means of declaring loyalty to you and to your loyalists

وَبِٱلْبَرَاءَةِ مِنْ أَعْدَائِكُمْ
wa bilbara'ati min a\´da'ikum
and declaring repudiation of your enemies

وَٱلنَّاصِبِينَ لَكُمُ ٱلْحَرْبَ
walnnasibina lakum alharba
and those who incur animosity of you

وَبِٱلْبَرَاءَةِ مِنْ أَشْيَاعِهِمْ وَأَتْبَاعِهِمْ
wa bilbara'ati min ashya\´ihim wa atba\´ihim
and repudiation of their adherents and followers.

إِنِّي سِلْمٌ لِمَنْ سَالَمَكُمْ
inni silmun liman salamakum
I am verily at peace with those who have been at peace with you,

وَحَرْبٌ لِمَنْ حَارَبَكُمْ
wa harbun liman harabakum
I am at war against those who fought against you,

وَوَلِيٌّ لِمَنْ وَالاَكُمْ
wa waliyyun liman walakum
loyalist to those who have been loyalist to you,

وَعَدُوٌّ لِمَنْ عَادَاكُمْ
wa \´aduwwun liman \´adakum
and enemy of those who have shown enmity towards you.

فَأَسْأَلُ ٱللَّهَ ٱلَّذِي أَكْرَمَنِي بِمَعْرِفَتِكُمْ
fa'as'alu allaha alladhi akramani bima\´rifatikum
So, I beseech Allah Who has endued me with the honor of recognizing you

وَمَعْرِفَةِ أَوْلِيَائِكُمْ
wa ma\´rifati awliya'ikum
and recognizing your loyalists

وَرَزَقَنِيَ ٱلْبَرَاءَةَ مِنْ أَعْدَائِكُمْ
wa razaqani albara'ata min a\´da'ikum
and Who conferred upon me with repudiation of your enemies,

أَنْ يَجْعَلَنِي مَعَكُمْ فِي ٱلدُّنْيَا وَٱلآخِرَةِ
an yaj\´alani ma\´akum fi alddunya wal-akhirati
to include me with you in this world and in the Hereafter

وَأَنْ يُثَبِّتَ لِي عِنْدَكُمْ قَدَمَ صِدْقٍ
wa an yuthabbita li \´indakum qadama sidqin
and to make firm step of honesty for me with you

فِي ٱلدُّنْيَا وَٱلآخِرَةِ
fi alddunya wal-akhirati
in this world and in the Hereafter.

وَأَسْأَلُهُ أَنْ يُبَلِّغَنِيَ ٱلْمَقَامَ ٱلْمَحْمُودَ لَكُمْ عِنْدَ ٱللَّهِ
wa as'aluhu an yuballighani almaqama almahmuda lakum \´inda allahi
I also beseech Him to make me attain the praiseworthy status that you enjoy with Allah

وَأَنْ يَرْزُقَنِي طَلَبَ ثَأْرِي
wa an yarzuqani talaba tha'ri
and to bestow upon me with the chance to take my own vengeance

مَعَ إِمَامِ هُدىًٰ ظَاهِرٍ
ma\´a imami hudan zahirin
with a leader of true guidance who is (Divinely) sustained

نَاطِقٍ بِٱلْحَقِّ مِنْكُمْ
natiqin bilhaqqi minkum
and expressing the truth from among you.

وَأَسْأَلُ ٱللَّهَ بِحَقِّكُمْ
wa as'alu allaha bihaqqikum
I also beseech Allah in your names

وَبِٱلشَّأْنِ ٱلَّذِي لَكُمْ عِنْدَهُ
wa bilshsha'ni alladhi lakum \´indahu
and in the name of the standing that you enjoy with Him

أَنْ يُعْطِيَنِي بِمُصَابِي بِكُمْ
an yu\´tiyani bimusabi bikum
to recompense me for my commiserations for you

أَفْضَلَ مَا يُعْطِي مُصَاباً بِمُصِيبَتِهِ
afdala ma yu\´ti musaban bimusibatihi
with the most favorite thing that He ever gives as compensation for misfortunes that has afflicted anyone.

مُصِيبَةً مَا أَعْظَمَهَا
musibatan ma a\´zamaha
(Your) misfortune has been so astounding

وَأَعْظَمَ رَزِيَّتَهَا فِي ٱلإِسْلاَمِ
wa a\´zama raziyyataha fi al-islami
and so catastrophic for Islam

وَفِي جَمِيعِ ٱلسَّمَاوَاتِ وَٱلأَرْضِ
wa fi jami\´i alssamawati wal-ardi
and for all the heavens and the entire earth.

اَللَّهُمَّ ٱجْعَلْنِي فِي مَقَامِي هٰذَا
allahumma ij\´alni fi maqami hadha
O Allah, (please) make me in this situation of mine

مِمَّنْ تَنَالُهُ مِنْكَ صَلَوَاتٌ وَرَحْمَةٌ وَمَغْفِرَةٌ
mimman tanaluhu minka salawatun wa rahmatun wa maghfiratun
one of those who receive blessings, mercy, and forgiveness from You.

اَللَّهُمَّ ٱجْعَلْ مَحْيَايَ مَحْيَا مُحَمَّدٍ وَآلِ مُحَمَّدٍ
allahumma ij\´al mahyaya mahya muhammadin wa ali muhammadin
O Allah, (please) make me live my lifetime in the same way as Muhammad and Muhammad’s Household lived

وَمَمَاتِي مَمَاتَ مُحَمَّدٍ وَآلِ مُحَمَّدٍ
wa mamati mamata muhammadin wa ali muhammadin
and make me die on the same principles on which Muhammad and Muhammad’s Household died.

اَللَّهُمَّ إِنَّ هٰذَا يَوْمٌ
allahumma inna hadha yawmun
O Allah, this day

تَبَرَّكَتْ بِهِ بَنُو أُمَيَّةَ
tabarrakat bihi banu umayyata
has been regarded as blessed day by the descendants of Umayyah

وَٱبْنُ آكِلَةِ ٱلأَكبَادِ
wabnu akilati al-akbadi
and by the son of the liver-eater woman,

ٱللَّعِينُ ٱبْنُ ٱللَّعِينِ
alla\´inu ibnu alla\´ini
the accursed and son of the accursed

عَلَىٰ لِسَانِكَ وَلِسَانِ نَبِيِّكَ
\´ala lisanika wa lisani nabiyyika
by the tongue of You and by the tongue of Your Prophet,

صَلَّىٰ ٱللَّهُ عَلَيْهِ وَآلِهِ
salla allahu \´alayhi wa alihi
Allah’s peace be upon him,

فِي كُلِّ مَوْطِنٍ وَمَوْقِفٍ
fi kulli mawtinin wa mawqifin
on every occasion and in every situation,

وَقَفَ فِيهِ نَبِيُّكَ صَلَّىٰ ٱللَّهُ عَلَيْهِ وَآلِهِ
waqafa fihi nabiyyuka salla allahu \´alayhi wa alihi
which Your Prophet, Allah’s peace be upon him, attended.

اَللَّهُمَّ ٱلْعَنْ أَبَا سُفْيَانَ وَمُعَاوِيَةَ وَيَزيدَ بْنَ مُعَاوِيَةَ
allahumma il\´an aba sufyana wa mu\´awiyata wa yazida bna mu\´awiyata
O Allah, pour curses upon Abu-Sufyan, Mu\´awiyah, and Yazid son of Mu\´awiyah.

عَلَيْهِمْ مِنْكَ ٱللَّعْنَةُ أَبَدَ ٱلآبِدِينَ
\´alayhim minka alla\´natu abada al-abidina
May Your curse be upon them incessantly and everlastingly.

وَهٰذَا يَوْمٌ فَرِحَتْ بِهِ آلُ زِيَادٍ وَآلُ مَرْوَانَ
wa hadha yawmun farihat bihi alu ziyadin wa alu marwana
This is the day on which the family of Ziyad and the family of Marwan gloated

بِقَتْلِهِمُ ٱلْحُسَيْنَ صَلَوَاتُ ٱللَّهِ عَلَيْهِ
biqatlihim alhusayna salawatu allahi \´alayhi
because they had killed al-Husayn, Allah’s blessings be upon him.

اَللَّهُمَّ فَضَاعِفْ عَلَيْهِمُ ٱللَّعْنَ مِنْكَ
allahumma fada\´if \´alayhim alla\´na minka
So, O Allah, pour frequent curses upon them

وَٱلْعَذَابَ (ٱلأَلِيمَ)
wal\´adhaba (al-alima)
and double for them the painful chastisement.

اَللَّهُمَّ إِنِّي أَتَقَرَّبُ إِلَيْكَ فِي هٰذَا ٱلْيَوْمِ
allahumma inni ataqarrabu ilayka fi hadha alyawmi
O Allah, I do seek nearness to You on this day,

وَفِي مَوْقِفِي هٰذَا
wa fi mawqifi hadha
on this occasion,

وَأَيَّامِ حَيَاتِي
wa ayyami hayati
and on all the days of my lifetime,

بِٱلْبَرَاءَةِ مِنْهُمْ وَٱللَّعْنَةِ عَلَيْهِمْ
bilbara'ati minhum walla\´nati \´alayhim
by repudiating these and invoking Your curses upon them,

وَبِٱلْمُوَالاَةِ لِنَبِيِّكَ وَآلِ نَبِيِّكَ
wa bilmuwalati linabiyyika wa ali nabiyyika
and by declaring loyalty to Your Prophet and Your Prophet’s Household,

عَلَيْهِ وَعَلَيْهِمُ ٱلسَّلاَمُ
\´alayhi wa \´alayhim alssalamu
peace be upon him and them.

You may then repeat the following Laan ** one hundred times:
اَللَّهُمَّ ٱلْعَنْ أَوَّلَ ظَالِمٍ
allahumma il\´an awwala zalimin
O Allah, pour curses upon the foremost persecutor

ظَلَمَ حَقَّ مُحَمَّدٍ وَآلِ مُحَمَّدٍ
zalama haqqa muhammadin wa ali muhammadin
who usurped the right of Muhammad and Muhammad’s Household

وَآخِرَ تَابِعٍ لَهُ عَلَىٰ ذٰلِكَ
wa akhira tabi\´in lahu \´ala dhalika
and the last follower who acceded to his deed.

اَللَّهُمَّ ٱلْعَنِ ٱلْعِصَابَةَ ٱلَّتِي جَاهَدَتِ ٱلْحُسَيْنَ
allahumma il\´an al\´isabata allati jahadat alhusayna
O Allah, pour curses upon the gang that struggled against al-Husayn

وَشَايَعَتْ وَبَايَعَتْ وَتَابَعَتْ عَلَىٰ قَتْلِهِ
wa shaya\´at wa baya\´at wa taba\´at \´ala qatlihi
and who supported each other against him, paid homage to his enemies, and participated in slaying him.


اَللَّهُمَّ ٱلْعَنْهُمْ جَمِيعاً
allahumma il\´anhum jami\´an
O Allah, pour curses upon all of them.


You may then repeat the following salam ** one hundred times:
اَلسَّلاَمُ عَلَيْكَ يَا أَبَا عَبْدِ ٱللَّهِ
alssalamu \´alayka ya aba \´abdillahi
Peace be upon you, O Abu-\´Abdullah

وَعَلَىٰ ٱلأَرْوَاحِ ٱلَّتِي حَلَّتْ بِفِنَائِكَ
wa \´ala al-arwahi allati hallat bifina'ika
and upon the souls that gathered in your courtyard.

عَلَيْكَ مِنِّي سَلاَمُ ٱللَّهِ أَبَداً
\´alayka minni salamu allahi abadan
Peace of Allah be upon you from me forever

مَا بَقيتُ وَبَقِيَ ٱللَّيْلُ وَٱلنَّهَارُ
ma baqitu wa baqiya allaylu walnnaharu
as long as I am existent and as long as there are day and night.

وَلاَ جَعَلَهُ ٱللَّهُ آخِرَ ٱلْعَهْدِ مِنِّي لِزِيَارَتِكُمْ
wa la ja\´alahu allahu akhira al\´ahdi minni liziyaratikum
May Allah not cause this (visit) to be the last of my visit to you (all).


اَلسَّلاَمُ عَلَىٰ ٱلْحُسَيْنِ
alssalamu \´ala alhusayni
Peace be upon al-Husayn,

وَعَلَىٰ عَلِيِّ بْنِ ٱلْحُسَيْنِ
wa \´ala \´aliyyi bni alhusayni
upon \´Ali ibn al-Husayn,

وَعَلَىٰ أَوْلاَدِ ٱلْحُسَيْنِ
wa \´ala awladi alhusayni
upon the sons of al-Husayn,

وَعَلَىٰ أَصْحَابِ ٱلْحُسَيْنِ
wa \´ala ashabi alhusayni
and upon the companions of al-Husayn.


You may then say the following :

اَللَّهُمَّ خُصَّ أَنْتَ أَوَّلَ ظَالِمٍ بِٱللَّعْنِ مِنِّي
allahumma khussa anta awwala zalimin billa\´ni minni
O Allah, pour special curses on the foremost persecutor

وَٱبْدَأْ بِهِ أَوَّلًا
wabda' bihi awwalan
and begin with him first,

ثُمَّ ٱلْعَنِ ٱلثَّانِيَ وَٱلثَّالِثَ وَٱلرَّابِعَ
thumma il\´an alththaniya walththalitha walrrabi\´a
and then pour curses on the second, the third, and the fourth.

اَللَّهُمَّ ٱلْعَنْ يَزِيدَ خَامِساً
allahumma il\´an yazida khamisan
O Allah, curse Yazid fifthly,

وَٱلْعَنْ عُبَيْدَ ٱللَّهِ بْنَ زِيَادٍ وَٱبْنَ مَرْجَانَةَ
wal\´an \´ubaydallahi bna ziyadin wabna marjanata
and curse \´Ubaydullah ibn Ziyad, the son of Marjanah,

وَعُمَرَ بْنَ سَعْدٍ وَشِمْراً
wa \´umara bna sa\´din wa shimran
\´Umar ibn Sa\´d, Shimr,

وَآلَ أَبِي سُفْيَانَ وَآلَ زِيَادٍ وَآلَ مَرْوَانَ
wa ala abi sufyana wa ala ziyadin wa ala marwana
the family of Abu-Sufyan, the family of Ziyad, and the family of Marwan

إِلَىٰ يَوْمِ ٱلْقِيَامَةِ
ila yawmi alqiyamati
up to the Resurrection Day.


You may then prostrate yourself and say the following words :

اَللَّهُمَّ لَكَ ٱلْحَمْدُ
allahumma laka alhamdu
O Allah, all praise be to You;

حَمْدَ ٱلشَّاكِرِينَ لَكَ عَلَىٰ مُصَابِهِمْ
hamda alshshakirina laka \´ala musabihim
the praise of those who thank You for their misfortunes.

اَلْحَمْدُ لِلَّهِ عَلَىٰ عَظِيمِ رَزِيَّتِي
alhamdu lillahi \´ala \´azimi raziyyati
All praise be to Allah for my great misfortune.

اَللَّهُمَّ ٱرْزُقْنِي شَفَاعَةَ ٱلْحُسَيْنِ يَوْمَ ٱلْوُرُودِ
allahumma irzuqni shafa\´ata alhusayni yawma alwurudi
O Allah, (please) grant me the intercession of al-Husayn on the Day of Coming (to You)

وَثَبِّتْ لِي قَدَمَ صِدْقٍ عِنْدَكَ
wa thabbit li qadama sidqin \´indaka
and make for me with You a firm step of honesty

مَعَ ٱلْحُسَيْنِ وَأَصْحَابِ ٱلْحُسَيْنِ
ma\´a alhusayni wa ashabi alhusayni
with al-Husayn and the companions of al-Husayn

ٱلَّذينَ بَذَلُوٱ مُهَجَهُمْ دُونَ ٱلْحُسَيْنِ عَلَيْهِ ٱلسَّلاَمُ
alladhina badhalu muhajahum duna alhusayni
who sacrificed their souls in defense of al-Husayn, peace be upon him.

**One of the narrations state that in case one is unable to recite 100 times the complete "Laan " & the "Sawlaat" the one may recite the shortened form ie last lines of the same 100 times as under:
Laan :
اَللَّهُمَّ ٱلْعَنْهُمْ جَمِيعاً
allahumma il\´anhum jami\´an
O Allah, pour curses upon all of them.

and Salwaat:-
اَلسَّلاَمُ عَلَىٰ ٱلْحُسَيْنِ
alssalamu \´ala alhusayni
Peace be upon al-Husayn,

وَعَلَىٰ عَلِيِّ بْنِ ٱلْحُسَيْنِ
wa \´ala \´aliyyi bni alhusayni
upon \´Ali ibn al-Husayn,

وَعَلَىٰ أَوْلاَدِ ٱلْحُسَيْنِ
wa \´ala awladi alhusayni
upon the sons of al-Husayn,

وَعَلَىٰ أَصْحَابِ ٱلْحُسَيْنِ
wa \´ala ashabi alhusayni
and upon the companions of al-Husayn.

  
  
  `


}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { triggerRefreshFavorites } = useRefreshFavorites();
  const colorScheme = useColorScheme() || "light";

  // Parse the prayer text into groups of three lines (Arabic, transliteration, translation)
  const prayerGroups = useMemo(() => {
    if (!prayerText) return [];
    // Split by newline, trim each line and remove empty lines
    const allLines = prayerText.split("\n").map(line => line.trim()).filter(Boolean);
    const groups = [];
    // Group every three lines together
    for (let i = 0; i < allLines.length; i += 3) {
      groups.push({
        arabic: allLines[i] || "",
        transliteration: allLines[i + 1] || "",
        translation: allLines[i + 2] || "",
      });
    }
    return groups;
  }, [prayerText]);

  // Check if prayer is in favorites when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      try {
        const favoriteStatus = await isPrayerInFavorites(prayerId);
        setIsFavorite(favoriteStatus);
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };
    checkFavoriteStatus();
  }, [prayerId]);

  // Handle adding to favorites
  const handleAddFavorite = async () => {
    try {
      await addPrayerToFavorites(prayerId);
      setIsFavorite(true);
      triggerRefreshFavorites();
      if (typeof addFavoriteToast === "function") {
        addFavoriteToast();
      }
    } catch (error) {
      console.error("Error adding prayer to favorites:", error);
    }
  };

  // Handle removing from favorites
  const handleRemoveFavorite = async () => {
    try {
      await removePrayerFromFavorites(prayerId);
      setIsFavorite(false);
      triggerRefreshFavorites();
      if (typeof removeFavoriteToast === "function") {
        removeFavoriteToast();
      }
    } catch (error) {
      console.error("Error removing prayer from favorites:", error);
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme].background },
      ]}
      showsVerticalScrollIndicator={false}
      bounces={false}
      overScrollMode="never"
    >
      <View style={styles.card}>
        {/* Header with Favorite Icon */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{arabicTitle}</Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={isFavorite ? handleRemoveFavorite : handleAddFavorite}
          >
            {isFavorite ? (
              <Ionicons
                name="star"
                size={28}
                color={Colors.universal.favoriteIcon || "#FFD700"}
              />
            ) : (
              <Ionicons
                name="star-outline"
                size={28}
                color={Colors.universal.favoriteIcon || "#FFD700"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Introduction */}
        <View style={styles.introContainer}>
          <ThemedText style={styles.introText}>
            {introduction}
          </ThemedText>
        </View>

        {/* Main Prayer Content */}
        <ThemedView style={styles.contentContainer}>
          {prayerGroups.length > 0 ? (
            prayerGroups.map((group, index) => (
              <View
                key={index}
                style={[
                  styles.prayerCard,
                  { borderColor: Colors[colorScheme].border },
                  index === prayerGroups.length - 1
                    ? { borderBottomWidth: 0, marginBottom: 0 }
                    : {},
                ]}
              >
                {/* Arabic and Transliteration */}
                <View style={styles.arabicContainer}>
                  <ThemedText style={styles.arabicText}>
                    {group.arabic}
                  </ThemedText>
                  <ThemedText style={styles.transliterationText}>
                    {group.transliteration}
                  </ThemedText>
                </View>
                {/* Translation */}
                <View style={styles.translationContainer}>
                  <ThemedText style={styles.translationText}>
                    {group.translation}
                  </ThemedText>
                </View>
              </View>
            ))
          ) : (
            <ThemedText style={styles.emptyText}>
              No prayer text provided or unable to parse the prayer.
            </ThemedText>
          )}
        </ThemedView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    flex: 1,
    overflow: "hidden",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  header: {
    backgroundColor: Colors.universal.primary,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: "#d1fae5",
  },
  favoriteButton: {
    position: "absolute",
    right: 20,
    top: 24,
    padding: 5,
  },
  introContainer: {
    padding: 24,
    backgroundColor: Colors.universal.third,
    borderBottomWidth: 1,
    borderBottomColor: "#d1fae5",
  },
  introText: {
    color: "#374151",
    lineHeight: 24,
  },
  contentContainer: {
    padding: 24,
  },
  prayerCard: {
    paddingBottom: 24,
    marginBottom: 24,
    borderBottomWidth: 1,
  },
  arabicContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
  },
  arabicText: {
    fontSize: 22,
    textAlign: "right",
    marginBottom: 8,
    writingDirection: "rtl",
  },
  transliterationText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "right",
  },
  translationContainer: {
    justifyContent: "center",
  },
  translationText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
  },
});

export default PrayerDisplay;
